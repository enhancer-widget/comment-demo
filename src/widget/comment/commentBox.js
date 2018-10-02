import './commentBox.less';
import locale from '../i18n';

const defaultProps = {
  commentMaxLength: 500,
  onComment() {},
}

export default class CommentBox {
  constructor(props, container) {
    this.props = $.extend(true, {}, defaultProps, props);
    this.props.commentMaxLengthTip = locale('commentMaxLengthTip', {max: this.props.commentMaxLength})
    this.container = $(container);
    this.render();
  }

  getContent() {
    return this.container.find('.comment-input').val().trim();
  }
  
  handleComment(e) {
    const value = this.getContent();
    if (value.length > this.props.commentMaxLength) {
      this.container.find('.comment-input').addClass('ui-state-error');
      this.container.find('.comment-input-tip').text(this.props.commentMaxLengthTip).show();
    } else if (value) {
      this.props.onComment(value, e);
      this.container.find('.comment-input').val('');
      return true;
    }
  }

  off() {
    this.container.off('click');
    this.container.find('.comment-input').off('focus').off('input');
  }

  on() {
    this.container.on('click', '.add-comment', (e) => {
      if (this.handleComment(e)) {
        $('.comment-input').val('');
        $('.comment-current-count').text('0');
      }
    });
    this.container.find('.comment-input').on('focus', (e) => {
      this.container.find('.comment-input').removeClass('ui-state-error');
      this.container.find('.comment-input-tip').hide();
    }).on('input', (e) => {
      const count = $(e.target).val().trim().length;
      const counter = this.container.find('.comment-current-count');
      counter.text(count);
      counter.toggleClass('error', count > this.props.commentMaxLength)
    });
  }

  destroy() {
    this.off();
    this.container = null;
    this.props = null;
  }

  render() {

    this.off();

    const btn = this.props.showAddBtn ? `<div class="comment-btn">
      <button class="add-comment ui-corner-all ui-button ui-state-default">
        ${locale('publish')}
      </button>
    </div>` : '';
    const tpl = `<div class="comment-box ui-helper-clearfix">
      <div class="comment-input-wrap" style="position: relative;">
        <textarea class="comment-input ui-widget-content" placeholder="${locale('commentPlaceholder')}" rows="4" ></textarea>
        <div class="comment-input-tip" style="display: none;"></div>
        <div class="comment-counter"><span class="comment-current-count">0</span> / ${this.props.commentMaxLength}</div>
      </div>
      ${btn}
    </div>`;

    this.container.html(tpl);   

    this.on(); 
  }
}