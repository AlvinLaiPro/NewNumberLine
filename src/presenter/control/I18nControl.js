/**
 * 功能控制器
 */
import lang from '../../../resources/locations/zh/lang.json';

export default class I18NControl {
    /**
     * 单例
     */
    static _inst;

    static getInst() {
        I18NControl._inst = I18NControl._inst || new I18NControl();
        return I18NControl._inst;
    }

    /**
     * 构造
     */
    constructor() {
        this.i18nData = lang;
    }
        /**
         * 析构
         */
    destroy() {
        I18NControl._inst = null;
    }

    /**
     * 初始化事件
     */
    init(app) {
        this.app = app;
        //TODO 多语言初始化事件
        let data = this.i18nData;
        let $view = this.app.$view;
        let $confirmBox_btn = $view.find('.NewNumberLine_dialog_wrapper').find('.com-dialog-btn');

        $view.find('.no_number').text(data['no_number']);
        $view.find('.customize').text(data['customize']);
        $view.find('.disaggregation').text(data['disaggregation']);
        $view.find('.add_point').text(data['add_point']);
        $view.find('.unit_value').text(data['unit_value']);
        $view.find('.btn_delete').text(data['btn_delete']);
        $view.find('.btn_clear').text(data['btn_clear']);
        $view.find('.btn_reset').text(data['btn_reset']);
        $view.find('.skip span').text(data['btn_skip']);
        $view.find('.shadow .round_txt').text(data['shadow']);
        $view.find('.distance .round_txt').text(data['distance']);
        $view.find('.showValue .round_txt').text(data['show_value']);
        $view.find('.btn_reset').text(data['btn_reset']);
        $confirmBox_btn.find('a:first').text(data['confirm']);
        $confirmBox_btn.find('a:last').text(data['cancel']);

        return this;
    }

}