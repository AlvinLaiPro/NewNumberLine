import BaseControl from './BaseControl'
import Keyboard from '../plug/keyboard';
import ConfirmBox from '../plug/confirmBox';
import Tooltip from '../plug/tooltip';
import Point from './Point';
let Fraction = require('fraction.js');
/**
 * 下方所有按钮事件的控制类
 * @author ChenDS
 */
export default class FunctionControl extends BaseControl {
    /**
     * 单例
     */
    static _inst;

    static getInst() {
        FunctionControl._inst = FunctionControl._inst || new FunctionControl();
        return FunctionControl._inst;
    }

    /**
     * 构造
     */
    constructor() {
        super();
    }

    /**
     * 初始化事件
     */
    init(app) {
        this.app = app;
        let $view = app.$view;
        //引导页
        this.$index = $view.find('.layerFull01');
        this.$skip = this.$index.find('.skip');
        this.$nextTep = this.$index.find('.nextTep');

        this.$body = $view.find('.NewNumberLine_body');
        this.$footer = $view.find('.NewNumberLine_footer');

        //解集
        this.$number_left = $view.find('.NewNumberLine_left');
        this.$solutionSet = this.$number_left.find('.com_btns');

        let $number_right = $view.find('div.NewNumberLine_right li');

        //点和解集的数值框点击时弹出的数字键盘
        this.$cvKeyboard = $view.find('.changeValue');
        this.$cvInput = $view.find('.cv_input');
        this.$cvInputContainer = this.$cvInput.parent();

        this._cvkbHalfWidth = this.$cvKeyboard.width() / 2;

        this.$disaggregationKeyboard = $view.find('.disKeyboard');
        this.$disaggregationInput = this.$disaggregationKeyboard.find('.sym_input');

        //标记点
        this.$markPoint = $number_right.eq(0);
        this.$mPKeyboardInput = this.$markPoint.find('.NewNumberLine_dialogInput');
        this.$mpInput = this.$mPKeyboardInput.find('.mPoint_input');
        this.$mpKeyboard = this.$mPKeyboardInput.find('.fractions_keyboard_list');

        //单位长度
        this.$unitLength = $number_right.eq(1);
        this.$uLModeSelector = this.$unitLength.find('.NewNumberLine_dialogInput');
        this.$ulInput = this.$uLModeSelector.find('.mPoint_input');
        this.$ulKeyboard = this.$uLModeSelector.find('.fractions_keyboard_list');

        let $uLDD = this.$uLModeSelector.find('dd');
        //无数值
        this.$noNumber = $uLDD.eq(0);
        //自定义
        this.$customize = $uLDD.eq(1);

        this.$reset = $number_right.eq(2);
        this.$clear = $number_right.eq(3);
        this.$delete = $number_right.eq(4);

        //确认框
        this.$confirmBox = $view.find('.NewNumberLine_layer');

        //无效输入的提示框
        this.$invalidTip = $view.find('.NewNumberLine_invalidInput');

        this.mpKeyboard = new Keyboard(this.$mpKeyboard, this.app.config.mpMaxLength, 2, (value) => this._setMPValue(value));
        this.ulKeyboard = new Keyboard(this.$ulKeyboard, this.app.config.ulMaxLength, 1, (value) => this._setULVaule(value));
        this.cvKeyboard = new Keyboard(this.$cvKeyboard, this.app.config.mpMaxLength, 2, (value) => this._changeValue(value));
        this.disKeyboard = new Keyboard(this.$disaggregationKeyboard, this.app.config.mpMaxLength, 2, (value) => this._setDisValue(value));
        this.confirmBox = new ConfirmBox(this.$confirmBox);
        this.toolTip = new Tooltip(this.$invalidTip);
        this._bindEvent();
        return this;
    }

    /**
     * 析构
     */
    destroy() {
        FunctionControl._inst = null;
        this._cvkbHalfWidth = null;
        this.mpKeyboard = null;
        this.ulKeyboard = null;
        this.cvKeyboard = null;
        this.disKeyboard = null;
        this.confirmBox = null;
        this.toolTip = null;
        this.$skip.off('click');
        this.$nextTep.off('click');
        this.$markPoint.off('click');
        this.$unitLength.off('click');
        this.$noNumber.off('click');
        this.$customize.off('click');
        this.$ulInput.off();
        this.$mpInput.off();
        this.$mpInput.parent().off();
        this.$cvInput.off();
        this.$disaggregationInput.off();
        $(document).off('keydown');
        this.$body.off('touchend click', this._globalClickEvent);
        this.$footer.off('click', this._globalClickEvent);
        this.$clear.off('click');
        this.$delete.off('click');
        this.$reset.off('click');
        this.$number_left.off('click');
    }

    /**
     * 绑定事件
     */
    _bindEvent() {
        //跳过引导页
        this.$skip.on('click', (e) => {
            this.$index.hide();
        });

        //下一步
        this.$nextTep.on('click', (e) => {
            let curIndex = this.app.data.guideIndex;
            this.app.data.guideIndex = curIndex + 1;
        });

        //标记点按钮上的事件监听
        this.$markPoint.on("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.app.data.editPoint) {
                this.app.data.editPoint.belong.showEdit = false;
                this.app.data.editPoint = null;
                return
            }
            this.app.data.solutionType = 0;
            this._hideULModeSelector();
            this._hideCVKeyboard();
            this.app.GraphControl._unSelected();
            if (!this.$markPoint.hasClass('ui_btn_active')) {
                this._showMPKeyboard();
            } else {
                this._hideMPKeyboardInput();
            }
        });
        //单位长度按钮上的事件监听
        this.$unitLength.on('click', e => {
            e.preventDefault();
            e.stopPropagation();
            if (this.app.data.editPoint) {
                this.app.data.editPoint.belong.showEdit = false;
                this.app.data.editPoint = null;
                return
            }
            this.app.data.solutionType = 0;
            this.app.GraphControl._unSelected();
            this._hideMPKeyboardInput();
            this._hideCVKeyboard();
            if (!this.$unitLength.hasClass('ui_btn_active')) {
                this._showULSelector();
            } else {
                this._hideULModeSelector();
            }
        });
        //无数值模式
        this.$noNumber.on('click', e => {
            e.preventDefault();
            e.stopPropagation();
            this.$uLModeSelector.hide();
            this.$unitLength.removeClass("ui_btn_active");
            this.confirmBox.showConfirmBox(this.app.i18N.i18nData['confirm_no_number'], () => {
                this.app.data.noNumber = true;
                this.app.data.clear = false;
                if (!this.app.data.reset) this.app.data.reset = true;
            });
        });
        //自定义模式
        this.$customize.on('click', e => {
            e.preventDefault();
            e.stopPropagation();
            this._showULKeyboard();
        });
        //点击键盘外其他任何地方，隐藏键盘以及将input的值置空
        this.$body.on('touchend click', this._globalClickEvent);
        this.$footer.on("click", this._globalClickEvent);

        //标记点和单位长度物理键盘输入的事件监听
        this.$mpInput.keypress((e) => this._phyKeyboard(e, this.app.config.mpMaxLength, 2, this.mpKeyboard, true));
        this.$mpInput.on("input", this._phyKeyboardInput.bind(this.$mpInput, true));
        this.$mpInput.parent().on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this.$ulInput.keypress((e) => this._phyKeyboard(e, this.app.config.ulMaxLength, 1, this.ulKeyboard));
        this.$ulInput.on("input", this._phyKeyboardInput);

        this.$cvInput.keypress((e) => this._phyKeyboard(e, this.app.config.mpMaxLength, 2, this.cvKeyboard, true));
        this.$cvInput.on("input", this._phyKeyboardInput.bind(this.$cvInput, true));
        this.$cvInput.on('touchend click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this.$disaggregationInput.keypress((e) => this._phyKeyboard(e, this.app.config.mpMaxLength, 2, this.disKeyboard, true));
        this.$disaggregationInput.on("input", this._phyKeyboardInput.bind(this.$disaggregationInput, true));
        this.$disaggregationInput.on('touchend click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        //重置
        this.$reset.on("click", () => this._reset());
        //清除
        this.$clear.on('click', () => this._clear());
        //删除
        this.$delete.on('click', () => this._delete());
        //解集
        this.$number_left.on('click', '.com_btns', this._solutionSet);

        //按esc键退出键盘
        $(document).on('keydown', (e) => {
            this._escHideKeyboard(e);
        });
    }

    _globalClickEvent(e) {
        let funInstance = FunctionControl.getInst();
        if (funInstance.app.data.editPoint) {
            funInstance.app.data.editPoint.belong.showEdit = false;
            funInstance.app.data.editPoint = null;
        }
        funInstance._hideKeyboard(e);
    }

    /**
     * 显示标记点的输入键盘以及相应的input
     */
    _showMPKeyboard() {
        this.$markPoint.addClass("ui_btn_active");
        this.$mPKeyboardInput.show();
        this.$mpInput.show();
        this.mpKeyboard.showKeyboard(this.$mpInput);
    }

    /**
     * 显示单位长度的模式选择框
     */
    _showULSelector() {
        this.$unitLength.addClass("ui_btn_active");
        this.$ulInput.show();
        this.$uLModeSelector.show();
    }

    /**
     * 显示单位长度的输入键盘
     */
    _showULKeyboard() {
        this.ulKeyboard.showKeyboard(this.$ulInput);
    }

    /**
     * 点击键盘外其他任何地方，隐藏键盘以及将input的值置空
     * @param e
     * @private
     */
    _hideKeyboard(e) {
        this._hideMPKeyboardInput();
        this._hideULModeSelector();
        this._hideCVKeyboard();
        this.app.data.solutionType = 0;
    }

    /**
     * 物理键盘上按Esc键退出键盘
     */
    _escHideKeyboard(e) {
        if (e && e.keyCode == 27) {
            FunctionControl.getInst()._hideKeyboard(e);
        }
    }

    /**
     * 标记点的输入键盘以及input隐藏
     */
    _hideMPKeyboardInput() {
        this.$mpInput.val('');
        this.$markPoint.removeClass("ui_btn_active");
        this.$mPKeyboardInput.hide();
    }

    /**
     * 单位长度的输入选择框以及键盘隐藏
     */
    _hideULModeSelector() {
        this.$ulInput.val('');
        this.$unitLength.removeClass('ui_btn_active');
        this.$ulKeyboard.hide();
        this.$uLModeSelector.hide();
    }


    _hideCVKeyboard() {
        this.$cvInput.val('');
        this.$cvInputContainer.hide();
        this.$cvKeyboard.hide();

    }

    /**
     * 设置标记点的数值
     * @param value input上当前的字符串
     */
    _setMPValue(value) {
        this._hideMPKeyboardInput();
        let num = this._parseValue(value, 2, true);
        if (typeof num === 'number' && isNaN(num)) {
            this.toolTip.showTooltip(this.app.i18N.i18nData['invalid_input']);
            return;
        }

        num = this._adjustValue(num);

        if (Point.totalPoint === 10) {
            this.toolTip.showTooltip(this.app.i18N.i18nData['overten_tip']);
            return;
        }

        this._isNeedJump(num);

        let point = new Point({
            index: this.app.config.pointIndex++ % 3,
            value: new Fraction(num),
            fraction: typeof num === 'string' || this.app.config.fraction,
        });
        point.showValue = true;
        this.app.data.pointArr = point;
        if (!this.app.data.reset) this.app.data.reset = true;
        this.setClearStatus();
    }


    /** 
     * 物理键盘输入事件监听，只允许数字，/、负号以及点
     * @param e 点击的事件
     * @param maxLength 最大允许输入的位数 
     * @param dotLength 最大允许输入小数位数 
     * @param curKeyboard 当前调出的键盘
     * @param negativeAble 是否可以输入负号，默认是不可以输入的
     */
    _phyKeyboard(e, maxLength, dotLength, curKeyboard, negativeAble = false) {
        //点击enter键
        if (e.keyCode == 13) {
            curKeyboard.enter(e);
            return;
        }
        let currentVal = curKeyboard.input.val();
        let str = String.fromCharCode(e.keyCode);
        if (str == '.' || str == '/') {
            return !currentVal.includes('.') && !currentVal.includes('/');
        }
        if (negativeAble && str == '-') {
            return !currentVal.includes('-');
        }

        let index = currentVal.indexOf('.');
        if (index !== -1) {
            let arr = currentVal.slice(index + 1);
            if (arr.length > dotLength - 1) return false;
        }
        //是否已经最大可输入的数值位数
        let length = currentVal.length;
        if (currentVal.includes('-')) length -= 1;
        if (currentVal.includes('.') || currentVal.includes('/')) length -= 1;
        if (length == maxLength) return false;

        return /^\d$/.test(str);
    }

    /**
     * input的物理键盘阻止中文输入
     */
    _phyKeyboardInput(negativeAble = false) {
        let $this = $(this);
        let value = $this.val();
        if (negativeAble) {
            $this.val(value.replace(/[^(\d|\-|\/|\.)]+/g, ""));
        } else {
            $this.val(value.replace(/[^(\d|\/|\.)]+/g, ""));
        }
    }

    /**
     * 自定义设置单位长度的值
     */
    _setULVaule(value) {
        this._hideULModeSelector();
        let num = this._parseValue(value, 1);
        if (typeof num === 'number') {
            if (isNaN(num) || num == 0) {
                this.toolTip.showTooltip(this.app.i18N.i18nData['invalid_input']);
                return;
            }
            if (num > 100) num = 100;
        } else {
            let temp = new Fraction(num);
            if (temp.s == 1 && temp.compare(0.1) < 0) num = '1/10';
        }
        this.confirmBox.showConfirmBox(this.app.i18N.i18nData['confirm_unitLength'], () => {
            this.app.data.unitValue = num;
            this.app.data.clear = false;
            if (!this.app.data.reset) this.app.data.reset = true;
        });
    }

    /**
     * 重置按钮的事件监听
     */
    _reset() {

        if (this.app.data.editPoint) {
            this.app.data.editPoint.belong.showEdit = false;
            this.app.data.editPoint = null;
            return
        }
        if (!this.app.data.reset) return;
        this.confirmBox.showConfirmBox(this.app.i18N.i18nData['confirm_reset'], () => {
            this.app.data.reset = false;
            this.app.data.clear = false;
        });
    }


    _clear() {

        if (this.app.data.editPoint) {
            this.app.data.editPoint.belong.showEdit = false;
            this.app.data.editPoint = null;
            return
        }
        if (!this.app.data.clear) return;
        this.confirmBox.showConfirmBox(this.app.i18N.i18nData['confirm_clear'], () => {
            this.app.data.clear = false;
            this.app.data.delete = false;
        });
    }

    /**
     * 删除按钮的事件监听
     */
    _delete() {
        if (!this.app.data.delete) return;
        this.app.data.delete.destroy();
        this.app.data.delete = false;
        //如果这时候数轴上没有任何点和解集，则清除按钮置灰
        if (this.app.data.solutionSet === 0 && this.app.data.pointArr.length === 0) {
            this.app.data.clear = false;
        }
    }

    /**
     * 解集按钮的事件监听
     */
    _solutionSet(e) {
        e.preventDefault();
        e.stopPropagation();
        let funInstance = FunctionControl.getInst();
        if (funInstance.app.data.editPoint) {
            funInstance.app.data.editPoint.belong.showEdit = false;
            funInstance.app.data.editPoint = null;
            return
        }
        //隐藏其他三个键盘
        funInstance._hideMPKeyboardInput();
        funInstance._hideULModeSelector();
        funInstance._hideCVKeyboard();

        let $this = $(this);
        let type = $this.data("type");
        if (funInstance.app.data.solutionSet === 3) return;
        funInstance.app.GraphControl._unSelected();
        if ($this.hasClass('ui_btn_active')) {
            $this.removeClass('ui_btn_active');
            funInstance.app.data.solutionType = 0;
            return;
        }
        funInstance.hideDisKeyboard();
        funInstance.$solutionSet.removeClass('ui_btn_active');
        $this.addClass('ui_btn_active');
        if (!funInstance.app.data.reset) funInstance.app.data.reset = true;
        funInstance.app.data.solutionType = type;
    }

    /**
     * 数轴上的点改变数值
     * @param {any} value
     * 
     * @memberOf FunctionControl
     */
    _changeValue(value) {
        let num = this._parseValue(value, 2, true);
        if (typeof num === 'number' && isNaN(num)) {
            this.$cvInputContainer.hide();
            this.toolTip.showTooltip(this.app.i18N.i18nData['invalid_input']);
            return;
        }
        num = this._adjustValue(num);
        this._isNeedJump(num);
        let obj = {
                value: new Fraction(num),
                fraction: typeof num === 'string' || this.app.config.fraction
            }
            //更新点的值
        this.app.data.currPoint && (this.app.data.currPoint.value = obj);
    }

    /**
     * 解集按钮上的值设置
     * 
     * @param {any} value 
     * @returns 
     * 
     * @memberOf FunctionControl
     */
    _setDisValue(value) {
        let num = this._parseValue(value, 2, true);
        if (typeof num === 'number' && isNaN(num)) {
            this.app.data.solutionType = 0;
            this.toolTip.showTooltip(this.app.i18N.i18nData['invalid_input']);
            return;
        }
        let type = this.app.data.solutionType;
        num = this._adjustValue(num);
        this._isNeedJump(num);
        let points = this.app.config.disaggregationPoints,
            len = points.length;
        for (let i = 0; i < len; i++) {
            if (!points[i] || !points[i].isShow) {
                points[i].value = num;
                points[i].type = type;
                points[i].isShow = true;
                this.app.disaggregation.changeZIndex(this.app.config.pointClassArr[i]);
                break;
            }
        }
        this.app.data.solutionSet += 1;
        this.app.disaggregation.updateDisaggregation();
        this.app.data.solutionType = 0;
        if (!this.app.data.reset) this.app.data.reset = true;
        this.setClearStatus();
    }

    /**
     * 
     * 是否需要跳转
     * @param {any} num
     * 
     */

    _isNeedJump(num) {
        let centerValue, unitValue, leftMaxLength, rightMaxLength, inputNum;
        centerValue = new Fraction(this.app.config.centerValue);
        unitValue = new Fraction(this.app.config.unitValue);
        leftMaxLength = unitValue.mul(this.app.config.leftDivision);
        rightMaxLength = unitValue.mul(this.app.config.rightDivision);
        inputNum = new Fraction(num);
        //需要跳转		
        if (!this.app.GraphControl.getCurrentRange(inputNum)) {
            let div = inputNum.div(unitValue).floor();
            let mod = inputNum.mod(unitValue);
            let newOriginPoint = mod.equals(0) ? inputNum : unitValue.mul(div);
            if (newOriginPoint.sub(leftMaxLength).compare(this.app.config.minValue) < 0) {
                newOriginPoint = leftMaxLength.add(this.app.config.minValue).sub(unitValue.div(2));
            } else if (newOriginPoint.add(rightMaxLength).compare(this.app.config.maxValue) > 0) {
                newOriginPoint = rightMaxLength.neg().add(this.app.config.maxValue).add(unitValue.div(2));
            }
            this.app.data.centerValue = newOriginPoint;
        }
    }

    /***************************************************************************
     * 对外接口
     **************************************************************************/
    /**
     * 设置按钮是否为置灰状态
     * @param btnType 按钮
     * @param val 是否置灰
     */

    setBtnState(btnType, val) {
        let btns = null;
        switch (btnType) {
            case 1:
                btns = this.$solutionSet;
                break;
            case 2:
                btns = this.$reset;
                break;
            case 3:
                btns = this.$clear;
                break;
            case 4:
                btns = this.$delete;
        }
        if (!val) {
            btns.addClass("click_disabled");
        } else {
            btns.removeClass('click_disabled');
        }
    }

    /**
     * 所有解集设置为未选中状态
     */
    solUnSelected() {
        this.$solutionSet.removeClass('ui_btn_active');
    }

    guideNextStep(val) {
        if (val > 5) this.$index.hide();
        let curClassName = `layerFull0${val - 1}`;
        this.$index.removeClass(curClassName);
        this.$index.addClass(`layerFull0${val}`);
    }

    /**
     * 
     * 显示键盘
     */
    showCVKeyboard() {
        let rectBox = this.app.data.currPoint.selectedGroup.$box;
        let left = rectBox.css('left'),
            width = rectBox.css('width'),
            height = rectBox.css('height'),
            className = rectBox.attr('class');
        let arr = className.split(' ');
        let bottom = -(this.app.config.hangingDistance - this.app.config.unitTextGap - this.app.config.distanceGap / 2);
        this.$cvInput.show();
        this.$cvInputContainer.show();
        this.$cvInputContainer.removeClass('blue pink green');
        this.$cvInputContainer.addClass(arr[1]);
        this.$cvInputContainer.css({
            'height': height,
            'width': width,
            'left': left
        });
        left = parseFloat(left);
        let sub = Math.abs(left) + this._cvkbHalfWidth - new Fraction(this.app.config.leftDivision).mul(this.app.config.unitLength).valueOf();
        if (sub > 0) {
            if (left < 0) {
                left += (sub + 3);
            } else {
                left -= (sub + 3);
            }
        }
        this.$cvKeyboard.css({
            left,
            bottom
        });
        this.cvKeyboard.showKeyboard(this.$cvInput);
    }

    /**
     * 显示解集键盘
     */
    showDisKeyboard(type) {
        this.$disaggregationInput.show();
        this.disKeyboard.showKeyboard(this.$disaggregationInput);
        let len = (type - 1) * 4.70834;
        this.$disaggregationKeyboard.css('marginLeft', `${len}em`);
    }

    hideDisKeyboard() {
        this.$disaggregationInput.val('');
        this.$disaggregationKeyboard.hide();
    }

    setClearStatus() {
        let arr = this.app.config.disaggregationPoints.filter((ele) => {
            return ele.isShow;
        });
        if (this.app.data.pointArr.length === 0 && arr.length === 0) {
            this.app.data.clear = false;
        } else {
            this.app.data.clear = true;
        }
    }

    /***************************************************************************
     * 内部用到的工具类
     **************************************************************************/

    /**
     * 将键盘上输入的值转化为有效的数值
     * 无效输入则返回NaN
     * @param value input上当前的字符串
     * @param dotLength 小数保留的位数，超出的部分四舍五入
     * @param isNeedFraction 当分数的值大于1时，是否需要保留分数
     */
    _parseValue(val, dotLength, isNeedFraction = false) {
        let result;
        let tempValue = Math.pow(10, dotLength);
        if (val === '.') return NaN;
        if (val.startsWith('.')) {
            val = '0' + val;
        }
        if (val.includes('-') && !val.startsWith('-')) {
            result = NaN;
        } else if (val.includes('/')) {
            let arr = val.split('/');
            let arr_0 = parseInt(arr[0]),
                arr_1 = parseInt(arr[1]);
            if ((isNeedFraction && arr_1 !== 0 && !isNaN(arr_0 / arr_1)) || arr_0 < arr_1) {
                result = val;
            } else {
                result = Math.round(arr_0 / arr_1 * tempValue) / tempValue;
            }
        } else {
            result = parseFloat(val);
        }
        //如果字符串里的值是0，那么直接设置为0
        if (typeof result === 'string' && parseFloat(result) == 0) {
            result = 0;
        }
        return (result == Infinity || result == -Infinity) ? NaN : result;
    }

    /**
     * 对超过【-1000，1000】范围的数值进行处理
     * 
     * @param {any} num
     * 
     */
    _adjustValue(num) {
        if (typeof num === 'number') {
            if (num > 1000) num = 1000;
            if (num < -1000) num = -1000;
        } else {
            let temp = new Fraction(num);
            if (temp.s == 1) {
                if (temp.compare(0.01) < 0) num = '1/100';
                if (temp.compare(1000) > 0) num = '1000';
            } else {
                if (temp.compare(-0.01) > 0) num = '-1/100';
                if (temp.compare(-1000) < 0) num = '-1000';
            }
        }
        return num;
    }
}