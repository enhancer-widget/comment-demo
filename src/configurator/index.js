/**
 * Widget Configurator Sample
 * The input and output of the configurator is the profile of its corressponding 
 * widget.
 * @author 
 * @created
 */

require('./index.less');

const locale = require('./i18n');
const template = require('./index.html');
const showMessage = msg => Enhancer.Message.alert({
  width: 280,
  height: 180,
  content: msg,
  confirmText: locale('confirm')
});

const configurator = {
  construct() {
    const tplHTML = template({
      locale: locale()
    });

    $('body').html(tplHTML);

    $('input[name=enableAddComment]').on('change', function () {
      $('input[name=addCommentCondition], input[name=maxCommentLength], input[name=showAddBtn]')
      .closest('tr').toggle(this.checked);
    });

    this.initDataSource();
  },

  initDataSource() {
    // 通过 配置页面 -> 数据源设置 -> 点击查看组件要求的数据格式说明, 查看 dataSpecification 的内容 
    const dataSpecification = `{
      "rows": [
        {
          "content": "xxx", // ${locale('contentField')}
        }
      ]
    }`;

    // 初始化数据源配置器
    this.dataSourceConfig = Enhancer.DatasourceManager.createConfigurator('dataSourceDom', {
      supportedTypes: ['rdb', 'http', 'static', 'jsonp'],
      dataSpecification: dataSpecification, // 组件数据格式说明 
      onSave: (source) => { // 当用户点击 保存数据源 按钮时会调用 onSave 方法 
        this.profile.dataSourceId = source.id;
      }
    });
  },
  /**
   * @setProfile {Function} [required] Will be called when user decides to  
   * config the widget on workbench.
   * @param profile {Object} The profile of corresponding widget.
   */
  setProfile(profile) {
    this.profile = profile || {};

    if (this.profile.dataSourceId) {
      Enhancer.DatasourceManager.getDatasource(this.profile.dataSourceId, (source) => {
        this.dataSourceConfig.setConfig(source);
      });
    }

    $('input[name=commentListTitle]').val(profile.commentListTitle || '');
    if (profile.enableAddComment) {
      $('input[name=enableAddComment]').click();
    }

    if (profile.showAddBtn) {
      $('input[name=showAddBtn]').prop('checked', true);
    }

    $('input[name=addCommentCondition]').val(profile.addCommentCondition || '');
    $('input[name=maxCommentLength]').val(profile.maxCommentLength || 500);
  },
  /**
   * @getProfile {Function} [required] Will be called when user click the save
   * button which is on the bottom of the configurator dialog. Note that if the
   * profile is invalid which is configurated by user, you should gave tips to
   * user and return false to prevent this save operation.
   * @return {Object} profile
   */
  getProfile() {
    if (!this.profile || !this.profile.dataSourceId) {
      showMessage(locale('setDataSource'));
      return false;
    }

    return {
      dataSourceId: this.profile.dataSourceId,
      commentListTitle: $('input[name=commentListTitle]').val(),
      enableAddComment: $('input[name=enableAddComment]').prop('checked'),
      addCommentCondition: $('input[name=addCommentCondition]').val(),
      maxCommentLength: $('input[name=maxCommentLength]').val(),
      showAddBtn: $('input[name=showAddBtn]').prop('checked')
    };
  },
  /**
   * @getSupportedEventList {Function} [optional] This method will be called if
   * implemented when the user click the save button to gather the events which
   * will be triggered in runtime by the widget instance. Note that the supported 
   * events would be different with the different profiles configurated by user in
   * the same type widget. 
   * @param profile {Object} The profile returned by getProfile() method which will be
   *   called before this method calling.
   * @return {Array<Object>} EventList
   */
  getSupportedEventList(profile) {
    const list = [];
    if (profile.showAddBtn) {
      list.push({
        id: "onAddComment",
        name: locale('addComment'),
        des: "Triggered when user post a new comment"
      });
    }
    return list;
  },
  /**
   * @getSupportedVariableList {Function} [optional] This method will be called if
   * implemented when the user click the save button, to gather the variables owned
   * by the widget instance. Note that the supported variables would be different with 
   * the different profiles configurated by user in the same type widget.
   * @param profile {Object} The profile returned by getProfile() method which will be
   *   called before this method calling.
   * @return VariableList {Array<Object>} 
   **/
  getSupportedVariableList(profile) {
    return [{
      name: 'content',
      type: 'string',
      des: 'The content of new comment'
    }];
  },
  /**
   * @getDependentVariableList {Function} [optional] This method is repsonsible
   * for gathering the dependent variables of the widget from context.
   * @param profile {Object} The profile returned by getProfile() method which will be
   *   called before this method calling.
   * @return {Array<String>}
   */
  getDependentVariableList(profile) {
    return Enhancer.VariablePattern.extractVariables(profile.commentListTitle || '').concat(
      Enhancer.VariablePattern.extractVariables(profile.addCommentCondition || '')
    ).concat(
      Enhancer.VariablePattern.extractVariables(profile.maxCommentLength || '')
    );
  }
};

// register configurator
Enhancer.registerWidgetConfigurator(configurator);