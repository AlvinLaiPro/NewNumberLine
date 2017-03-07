import Point from '../control/Point'
let Fraction = require('fraction.js');
export default class AppData {
    /**
     * 单例
     */
    static _inst;

    static getInst() {
        AppData._inst = AppData._inst || new AppData;
        return AppData._inst;
    }

    constructor() {
        this._defaultData = {
            editPoint: null,
            centerValue: new Fraction(0),
            pointArr: [],
            delete: false, //是否可删除
            fraction: false, // 是否为分数数轴
            noNumber: false, // 是否无数值编号
            position: null, // 数轴位置 默认为null
            unitLength: 0, // 单位长度 默认为0
            originPointValue: 0, // 原点数值
            unitValue: 1, // 一格代表的数
            solutionSet: 0, //解集的个数
            solutionType: 0, //当前解集的类型，0为未选中，1,2,3,4依次代表< <= >= >这四种类型
            reset: false, //是否可重置
            clear: false, //是否可清除
            guideIndex: 1, //当前引导页的index
            hasDistance: false, //是否有距离显示
            currPoint: null //当前数值框被选中的点
        };

        // this.data = {};

    }

    init(app, data) {
        this.app = app;
        if (!data) {
            data = this._defaultData;
        }
        this.data = $.extend({}, data);
        return this;
    }

    destroy() {
        AppData._inst = null;
    }


    get pointArr() {
        return this.data.pointArr
    }
    set pointArr(val) {
        this.data.pointArr.push(val);
    }

    get delete() {
        return this.data.delete
    }
    set delete(val) {
        this.data.delete = val;
        this.app.func.setBtnState(4, val);
    }

    get clear() {
        return this.data.clear;
    }

    set clear(val) {
        this.data.clear = val;
        this.app.func.setBtnState(3, val);
        if (!val) {
            this.app.disaggregation.clear();
            this._destroyPoints(this.data.pointArr);
        }
    }

    get reset() {
        return this.data.reset;
    }
    set reset(val) {
        this.data.reset = val;
        this.app.func.setBtnState(2, val);
        if (!val) {
            this.app.config.setDefaultData();
            this.app.disaggregation.clear();
            this.solutionType = 0;
            this.delete = false;
            this._destroyPoints(this.data.pointArr);
            this.app.GraphControl.updateByType();
        }
    }

    get noNumber() {
        return this.data.noNumber
    }
    set noNumber(val) {
        this.app.config.setDefaultData('noNumber', val);
        if (val) {
            this._destroyPoints(this.data.pointArr);
            this.app.disaggregation.clear();
        }
        this.app.GraphControl.updateByType('noNumber');
    }

    get position() {
        return this.data.position
    }
    set position(val) {
        this.data.position = val;
        this.app.config.position = val;
        this.app.GraphControl.drag(val);
    }

    get unitLength() {
        return this.app.config.unitLength
    }
    set unitLength(val) {
        this.app.config.unitLength = val;
        // this.app.config.span = Math.round(this.app.config.pointRadius * 2 / val * 100) / 100;
        this.app.GraphControl.updateByType('stretch');
        for (let point of this.data.pointArr) {
            point.setPosition(true);
        };
        this.app.disaggregation.updateDisaggregation();
    }

    get unitValue() {
        return this.data.unitValue
    }
    set unitValue(val) {
        this.app.config.setDefaultData('unitValue', val);
        this.app.config.fraction = typeof val === 'string';

        this.app.GraphControl.updateByType('unitChange');

        this._destroyPoints(this.data.pointArr);
        this.app.disaggregation.clear();
    }


    get solutionSet() {
        return this.data.solutionSet;
    }

    set solutionSet(val) {
        this.data.solutionSet = val;
        this.app.func.setBtnState(1, val < 3);
    }

    get solutionType() {
        return this.data.solutionType;
    }

    set solutionType(val) {
        this.data.solutionType = val;
        if (val == 0) {
            this.app.func.solUnSelected();
            this.app.func.hideDisKeyboard();
        } else {
            this.app.func.showDisKeyboard(val);
        }
    }

    get originPointValue() {
        return this.data.originPointValue;
    }

    set originPointValue(val) {
        this.app.config.jumpOriginPointValue = val;
        this._isJump = true;
        this.leftDivision = this.app.config.leftDivision;
        this.app.GraphControl.drawBasic();
        this.app.GraphControl.hidePoints(this._isJump);
        this.app.disaggregation.updateDisaggregation();
        this._isJump = false;
    }

    _destroyPoints(points) {
        while (points.length) {
            points[0].destroy();
        }
    }

    get centerValue() {
        return this.app.config.centerValue;
    }

    set centerValue(val) {
        this.app.config.centerValue = val;
        this.app.GraphControl.updateByType('move');
        this.app.func._hideKeyboard();
        for (let point of this.data.pointArr) {
            point.setPosition(true);
        };
    }

    get guideIndex() {
        return this.data.guideIndex;
    }

    set guideIndex(val) {
        this.data.guideIndex = val;
        this.app.func.guideNextStep(val);
    }

    get hasDistance() {
        return this.data.hasDistance;
    }

    set hasDistance(val) {
        if (this.data.hasDistance !== val) {
            this.data.hasDistance = val;
            this.app.disaggregation.updateDisaggregation();
        }
    }

    get currPoint() {
        return this.data.currPoint;
    }

    set currPoint(val) {
        this.data.currPoint = val;

    }

    get editPoint() {
        return this.data.editPoint;
    }

    set editPoint(val) {
        this.data.editPoint = val;
    }
}