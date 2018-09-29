import EnhancerComment from './comment';
import cloneDeep from 'lodash/cloneDeep';
import './index.less';

Enhancer.registerWidget( {
  construct(prof, zContext) {
    this.prof = prof;
    this.prof.componentId = this.id();
    this.render();
  },

  loadPage(page, pageSize, success) {
    // 下一页加载方式
    this.getSourceData(this.prof.dataSourceId, {
      page: page,
      rowNum: pageSize,
      countRecords: true,
      paged: true
    }, success);
  },

  render() {
    const container = this.getContainer();
    const node = container[0];
    const prof = this.prof;
    

    const props = $.extend(true, {
      loadPage: this.loadPage.bind(this),
      onComment: (method, data, cb) => {
        this.data =  cloneDeep(data);
        this.trig(method, this.data, (res) => {
          res = res || {};
          cb(res.message);
        });
      }
    }, prof);

    props.commentListTitle = Enhancer.ZContext.parse(prof.commentListTitle);
    props.maxCommentLength = Enhancer.ZContext.parse(prof.maxCommentLength);
    if (props.enableAddComment) {
      props.enableAddComment = Enhancer.Util.testCondition(prof.addCommentCondition || '');
    }

    this.inst && this.inst.destroy();
    this.inst = new EnhancerComment(props, node);

    this.trig('complete');
  },

  isValid() {
    return this.inst ? this.inst.isValid() : true;
  },

  getData() {
    return this.data || {};
  },

  affected( zContext ) {
    this.render();
  },

  destroy() {
    this.inst.destroy();
  }
});
