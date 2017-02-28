/**
 * 组件：数字键盘
 * @author ChenDS
 */
export default class Keyboard {
	/**
	 * 构造函数
	 * @param $keyboardView 数字键盘的DOM
	 * @param maxLength 最大允许的输入位数，"." "/" "-"这三个不算在位数中
	 * @param dotLength 小数的最大允许输入位数
	 * @param cb 值变化的回调函数，参数是当前输入的值
	 */
	constructor($keyboardView, maxLength, dotLength, cb) {
		this._$keyboard = $keyboardView;
		this._cb = cb;
		this._maxLength = maxLength;
		this._init(dotLength);
	}

	/**
	 * 析构
	 */
	destroy() {
		this._$keyboard.off();
	}

	/**
	 * 调出数字键盘
	 */
	showKeyboard($input) {
		this._$input = $input;
		this._curVal = $input.val();
		this._$keyboard.show();
		this._$input.focus();
	}

	/**
	 * 初始化事件
	 */
	_init(dotLength) {
		this._$keyboard.on("click", 'a:not(.btn_del, .btn_enter, .btn_dot, .btn_div, .btn_negative)', e => this._setInputValue(e, dotLength));
		this._$keyboard.on("click", 'a.btn_enter', e => this.enter(e));
		this._$keyboard.on("click", 'a.btn_del', e => this._back(e));
		this._$keyboard.on("click", 'a.btn_negative',e => this._oneClick(e));
		this._$keyboard.on("click", 'a.btn_dot',e => this._dotClick(e));
		this._$keyboard.on("click", 'a.btn_div',e => this._divClick(e));
		this._$keyboard.on('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			this._$input.focus();
		});
	}

	/**
	 * 点击键盘上的数字时对应的事件
	 * @param e
	 */
	_setInputValue(e, dotLength) {
		let value = e.currentTarget.textContent;
		let currentVal = this._$input.val();
		//如果小数已经是最大可输入位数,则无法再输入 
		let index = currentVal.indexOf('.');
		if (index !== -1) {
			let arr = currentVal.slice(index + 1);
			if(arr.length > dotLength - 1) return; 
		}
		value = currentVal + value;
		let length = value.length;
		if(value.indexOf('-') != -1) length -= 1;
		if(value.indexOf('.') != -1 || value.indexOf('/')!= -1) length -= 1;
		if (length <= this._maxLength) {
			this._$input.val(value);
		}
	}

	/**
	 * 点号只能点击一次,如果已经点击"/"按钮，则点击无效
	 */
	_dotClick(e) {
		let value = e.currentTarget.textContent;
		let currentVal = this._$input.val();
		if(currentVal.indexOf(value) == -1 && currentVal.indexOf('/') == -1) {
			value = currentVal + value;
			this._$input.val(value); 
		}
	}

	/**
	 * 负号只能点击一次
	 */
	_oneClick(e) {
		let value = e.currentTarget.textContent;
		let currentVal = this._$input.val();
		if(currentVal.indexOf(value) == -1) {
			value = currentVal + value;
			this._$input.val(value); 
		}
	}

	/**
	 * 分号只能点击一次,如果已经点击“.”按钮，则点击无效
	 */
	_divClick(e) {
		let value = e.currentTarget.textContent;
		let currentVal = this._$input.val();
		if(currentVal.indexOf(value) == -1 && currentVal.indexOf('.') == -1) {
			value = currentVal + value;
			this._$input.val(value); 
		}
	}

	/**
	 * 键盘上x按钮的监听函数
	 * @param e
	 */
	_back(e) {
		let currentInput = this._$input.val();
		this._$input.val(currentInput.slice(0, -1));
	}

	/***************************************************************************
	 * 对外接口
	 **************************************************************************/

	/**
	 * 键盘上点击enter的监听事件
	 * @param e
	 */
	enter(e) {
		this._$keyboard.hide();
		this._cb(this._$input.val());
		this._$input.hide();
	}
	
	get input() {
		return this._$input;
	}
}
