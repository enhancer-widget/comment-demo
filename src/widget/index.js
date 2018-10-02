import EnhancerComment from './comment';
import cloneDeep from 'lodash/cloneDeep';
import './index.less';

const log = window.console.log.bind(window.console);

Enhancer.registerWidget( {
  construct(prof, zContext) {
    log('call construct');

    this.prof = prof;
    this.prof.componentId = this.id(); // 用于区别同一个页面渲染多个评论组件
    this.render(true, zContext);
  },

  onFrameReady() {
    log('call onFrameReady');
  },

  affected(zContext) {
    log('call affected');

    this.render(false, zContext);
  },

  isValid() {
    log('call isValid');

    return this.inst.isValid();
  },

  getData() {
    log('call getData');

    return this.inst.getData();
  },

  onResize() {
    log('call onResize');
  },

  destroy() {
    log('call destroy');
    
    this.prof = null;
    this.inst.destroy();
    this.inst = null;
  },


  render(init, zContext) {
    // const xxx =  zContext.val('11-xxx'); // 获取变量 11-xxx 的值

    const container = this.getContainer(); // 组件应该渲染到这个容器里
    const node = container[0];
    const prof = this.prof;
    

    const props = $.extend(true, {
      parent: this
    }, prof);

    // 处理各个配置项可能包含变量的情况
    props.commentListTitle = Enhancer.ZContext.parse(prof.commentListTitle);
    props.maxCommentLength = Enhancer.ZContext.parse(prof.maxCommentLength);
    if (props.enableAddComment) {
      // enableAddComment 是一个布尔表达式, 通过 testCondition 来返回 true 或 false
      props.enableAddComment = Enhancer.Util.testCondition(prof.addCommentCondition || '');
    }

    this.inst && this.inst.destroy();
    this.inst = new EnhancerComment(props, node);

    if (init) {
      log('trig complete');
      this.trig('complete');
    }
  },

  onComment(method, data, cb) {
    log('trig ', method)
    this.trig(method, data, cb);
  }
});
