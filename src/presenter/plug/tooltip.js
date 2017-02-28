/**
 * 组件：提示框
 * @example
 *        创建一个提示框组件，用于提示信息,该提示框5s后消失
 *        let tooltip = new Tooltip(
 *            $tooltipDom,
 *            () => console.log(`提示框消失了，接下来要做的事情`),5000
 *        );
 *
 * @author ChenDS
 */
export default class Tooltip {
	/**
	 * 构造
	 * @param $tipDom 提示框的dom
 	 * @param cb 回调函数，用于在提示框消失的时候执行
	 * @param time 提示框存在的时间，默认是2s
	 */
	constructor($tipDom,cb,time = 2000) {
		this._$tooltipDom = $tipDom;
		this._cb = cb;
		this._time = time;
		this._closeable = false;
	}

	/**
	 * 析构
	 */
	destroy() {
	}

	/**
	 * 初始化
	 * @private
	 */
	_init() {

	}

	/***************************************************************************
	 * 对外接口
	 **************************************************************************/
	/**
	 * 显示提示框,如果有传入str参数，则将提示框里的信息设置为传入的参数
	 * @param str 显示的信息
	 * @param isTimeCall 提示框是否定时消失并执行回调函数
	 */
	showTooltip(str,isTimeCall = true) {
		str && this._setMessage(str);
		this._$tooltipDom.show();
		isTimeCall && setTimeout(() => this._closeTooltip(),this._time);
		this._closeable = !isTimeCall;
	}

	/**
	 * 隐藏提示框,用于非定时消失的提示框需要隐藏时调用的接口
	 */
	hideTooltip() {
		if(!this._closeable) return;
		this._$tooltipDom.hide();
	}

	/***************************************************************************
	 * 其它
	 **************************************************************************/
	/**
	 * 关闭提示框，并调用回调函数
	 * @private
	 */
	_closeTooltip() {
		this._$tooltipDom.hide();
		this._cb && this._cb();
	}

	/**
	 * 设置提示框的显示内容
	 * @private
	 */
	_setMessage(str) {
		this._$tooltipDom.find(".tip-txt").text(str);
	}
}