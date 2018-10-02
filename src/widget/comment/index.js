
import 'twbs-pagination';
import CommentBox from './commentBox';
import './index.less';
import locale from '../i18n';


export default class EnhancerComment {
  constructor(props, container) {
    this.props = props;
    this.container = $(container);
    this.render();
  }

  loadPage(page, render) {

    this.container.find('.comment-empty').hide();
    this.container.find('.comment-list-wrap').hide();
    this.container.find('.comment-loading').show();

    const parent = this.props.parent;
    const dataSourceId = this.props.dataSourceId;

    parent.getSourceData(dataSourceId, {
      page: page,
      rowNum: 10,
      countRecords: true,
      paged: true
    }, (data) => {
      if (Array.isArray(data)) {
        data = {
          rows: data
        }
      }
      if (!data.rows) {
        console.error('no rows found');
        return;
      }

      data.records = data.records || data.rows.length;
      this.listData = data.rows;

      const listTpl = this.renderList();
      this.container.find('.comment-loading').hide();
      if (data.rows.length) {
        this.container.find('.comment-list-wrap')
        .find('.comment-list').html(listTpl)
        .end().show();
      } else {
        this.container.find('.comment-empty').show();
      }

      if (render && data.rows.length) {
        this.renderPagination(data);
      } 
    });
  }

  handleComment(data, value, e) {
    const parent = this.props.parent;
    parent.onComment('onAddComment', {
      content: value,
    }, () => {
    });
  }

  isValid() {
    const content = this.commentBox.getContent();
    return content.length <= this.props.maxCommentLength;
  }

  getData() {
    return {
      content: this.commentBox ? this.commentBox.getContent() : ''
    };
  }
  
  renderList() {
    const data = this.listData || [];
    return data.map((item, i) => {
      return `<div>
        <div class="comment-wrap">
          <div class="comment-avatar" style="width: 36px; height: 36px;">
            <img src="${item.avatar}" />
          </div>
          <div class="comment-content-wrap">
            <div>
              <span>${item.nickname}</span>
              <span class="comment-time">${item.created}</span>
            </div>
            <div class="comment-content">${item.content}</div>
            <div class="comment-item-op"></div>
          </div>
        </div>
      </div>`
    }).join('');
  }


  renderPagination (data) {
    let total = parseInt(data.records, 10);

    const pagination = this.container.find('.comment-pagination');
    this.pagination && this.pagination.twbsPagination('destroy');
    this.pagination = pagination.twbsPagination({
      initiateStartPageClick: false,
      totalPages: Math.ceil(total / 10),
      visiblePages: 7,
      first: '<<',
      prev: '<',
      next: '>',
      last: '>>',
      activeClass: 'ui-state-active',
      disabledClass: 'ui-state-disabled',
      pageClass: 'page-item ui-state-default',
      nextClass: 'page-item ui-state-default next',
      prevClass: 'page-item ui-state-default prev',
      lastClass: 'page-item ui-state-default last',
      firstClass: 'page-item ui-state-default first',
      onPageClick: (event, page) => {
        this.loadPage(page);
      }
    });
  }

  renderListWrap() {

    const commentListTitle = this.props.commentListTitle ? `<div class="comment-list-title">
        ${this.props.commentListTitle}
      </div>` : '';
      
    return `<div class="comment-list-container">
      ${commentListTitle}
      <div>
        <div class="comment-loading"><div class="progress-label">Loading...</div></div>
        <div class="comment-list-wrap ui-helper-clearfix" style="display: none">
          <div class="comment-list">
            ${this.renderList()}
          </div>
          <div class="comment-pagination"></div>
        </div>
        ${this.renderEmpty()}
      </div>
    </div>`
  }

  renderEmpty() {
    return `<div class="comment-empty" style="display: none">
      ${locale('noData')}
    </div>`
  }

  off() {
    this.container.off('click');
  }

  on() {
  }

  destroy() {
    this.off();
    
    this.commentBox && this.commentBox.destroy();
    this.commentBox = null;

    this.pagination && this.pagination.twbsPagination('destroy');
    this.pagination = null;

    this.loading && this.loading.progressbar('destroy');
    this.loading = false;

    this.confirmBox && this.confirmBox.dialog('destroy').remove();
    this.confirmBox = null;

    this.props.parent = null;
    this.props = null;
  }

  renderChildren() {
    if (this.props.enableAddComment) {
      this.commentBox && this.commentBox.destroy();
      const props = $.extend(true, {}, this.props, {
        onComment: this.handleComment.bind(this, {
          action: 'add'
        })
      });
      this.commentBox = new CommentBox(props, this.container.find('.comment-box-container'));
    }

    
    this.loading && this.loading.progressbar('destroy');
    this.loading = this.container.find('.comment-loading').progressbar({
      value: false
    });
  }

  render() {
    this.off();

    const commentBox = this.props.enableAddComment ? `<div class="comment-box-container"></div>` : '';
    const tpl = `<div class="enhancer-comment ui-helper-clearfix enhancer-comment-bottom">
      ${ this.renderListWrap() }
      ${ commentBox }
    </div>`;

    this.container.html(tpl);

    this.on();

    this.renderChildren();

    this.loadPage(1, true);
  }
};
