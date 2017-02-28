/**
 * 组件：确认框
 * @example
 *        创建一个确认框组件，用于确认是否进行操作
 *        let tooltip = new Tooltip(
 *            $tooltipDom,
 *            () => console.log(`提示框消失了，接下来要做的事情`),5000
 *        );
 *
 * @author ChenDS
 */
export default class ConfirmBox {
	/**
	 * 构造
	 * @param $confirmDom 确认框的dom
	 */
	constructor($confirmDom) {
		this._$confirmDom = $confirmDom;
		this.$com_dialog_btn = this._$confirmDom.find('.com-dialog-btn');
		this._cb = null;
		this._init();
	}

	/**
	 * 析构
	 */
	destroy() {
		this.$com_dialog_btn.find('a').off('click');	
	}

	/**
	 * 初始化
	 * @private
	 */
	_init() {
		this.$com_dialog_btn.find('a:first').on("click", () => this._confirm());
		this.$com_dialog_btn.find('a:last').on('click', () => this._cancel());
	}

	/***************************************************************************
	 * 对外接口
	 **************************************************************************/
	/**
	 * 显示提示框,如果有传入str参数，则将提示框里的信息设置为传入的参数
	 * @param str 显示的信息
	 * @param cb 点击确认按钮的回调函数
	 */
	showConfirmBox(str, cb) {
		str && this._setMessage(str);
		this._$confirmDom.show();
		this._cb = cb;
	}

	/***************************************************************************
	 * 其它
	 **************************************************************************/
	/**
	 * 点击确认按钮
	 * @private
	 */
	_confirm() {
		this._$confirmDom.hide();
		this._cb();
	}

	/**
	 * 点击取消按钮
	 * @private
	 */
	_cancel() {
		this._$confirmDom.hide();
	}

	/**
	 * 设置确认框的显示内容
	 * @private
	 */
	_setMessage(str) {
		this._$confirmDom.find(".tip-txt").text(str);
	}
}