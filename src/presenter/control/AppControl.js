import BaseControl from "./BaseControl";
import AppConfig from '../model/AppConfig';
import AppData from '../model/AppData';
import I18NControl from './I18NControl'
import GraphControl from './GraphControl'
import FunctionControl from './FunctionControl'
import DisaggregationControl from './DisaggregationControl'

/**
 * 功能控制器
 */
export default class AppControl extends BaseControl {
    /**
     * 单例
     */
    static _inst;

    static getInst() {
        AppControl._inst = AppControl._inst || new AppControl();
        return AppControl._inst;
    }

    /**
     * 构造
     */
    constructor() {
        super();
    }

    /**
     * 析构
     */
    destroy() {
        this.data.destroy();
        this.i18N.destroy();
        this.config.destroy();
        this.func.destroy();
        this.GraphControl.destroy();
        this.disaggregation.destroyAll();
        this.data = null;
        this.i18N = null;
        this.config = null;
        this.func = null;
        this.GraphControl = null;
        this.disaggregation = null;
        this.$view = null;
        AppControl._inst = null;
    }


    /**
     * 初始化事件
     */
    init(view, extendData) {
        this.basePath = '../';
        this.$view = $(view);
        this.i18N = I18NControl.getInst().init(this)
        this.config = AppConfig.getInst().init(this);
        this.func = FunctionControl.getInst().init(this);
        this.GraphControl = GraphControl.getInst().init(this);
        this.disaggregation = DisaggregationControl.getInst().init(this);
        this.data = AppData.getInst().init(this, extendData);
        return this;
    }

}