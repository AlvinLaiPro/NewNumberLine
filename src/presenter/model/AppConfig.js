/**
 * 颗粒配置环境
 *
 * @author Tiago
 */
let Fraction = require('fraction.js');
class AppConfig {

    /**
     * 单例
     */
    static _inst;

    static getInst() {
        AppConfig._inst = AppConfig._inst || new AppConfig();
        return AppConfig._inst;
    }

    /**
     * 初始化
     */
    init(app) {
        let that = this;
        this.app = app;
        this.fontSize = this.app.$view.find('#layout').css('font-size').replace(/px/, '');
        this.basePath = '../';

        this.fraction = false; // 是否为分数数轴
        this.noNumber = false; // 是否无数值编号
        this.unitLength = Math.round(this.fontSize / 24 * 100); // 单位长度
        this.minUnitLength = this.unitLength;
        this.maxUnitLength = this.unitLength * 5;
        this.unitValue = '1'; // 一格代表的数
        this.mpMaxLength = 5; //标记点的最大可输入位数，不计“/”、“.”、“-”
        this.ulMaxLength = 4; //单位长度的最大可输入位数
        this.minValue = -1000;
        this.maxValue = 1000;
        this.centerValue = new Fraction(0);

        // 绘制设置
        this.yRatio = Math.round(541 / 896 * 100) / 100;
        this.baseColor = '#333333';
        this.axisWidth = Math.round(this.fontSize / 24 * 8);
        this.unitWidth = Math.round(this.fontSize / 24 * 4);
        this.unitHeight = Math.round(this.fontSize / 24 * 45);
        this.originCircleRadius = Math.round(this.fontSize / 24 * 11);

        this.unitTextGap = Math.round(this.fontSize / 24 * 40);

        this.sideControlDistance = Math.round(this.fontSize / 24 * 30);

        // this.controlRadius = Math.round(this.fontSize / 24 * 14);
        // this.controlInnerRadius = Math.round(this.fontSize / 24 * 9);
        // this.controlOuterRadius = Math.round(this.fontSize / 24 * 19);

        this.pointIndex = 0;
        this.pointImageArr = [
            this.basePath + 'resources/images/markgreen.png',
            this.basePath + 'resources/images/markred.png',
            this.basePath + 'resources/images/markyellow.png',
        ];
        this.pointImageWidth = Math.round(this.fontSize / 24 * 40);


        this.pointSelectedImageArr = [
            this.basePath + 'resources/images/markgreen-on.png',
            this.basePath + 'resources/images/markred-on.png',
            this.basePath + 'resources/images/markyellow-on.png',
        ];

        this.pointSelectedImageWidth = Math.round(this.fontSize / 24 * 42);
        this.pointColorArr = [
            '#00a9a0',
            '#ff3954',
            '#0074f7'
        ];

        this.pointClassArr = [
            'green',
            'pink',
            'blue'
        ];

        this.pointRadius = Math.round(this.fontSize / 24 * 15);

        this.controlStrokeWidth = Math.round(this.fontSize / 24 * 10);

        //Math.round(this.pointRadius * 2 / this.unitLength * 100) / 100;
        this.span = this.unitValue / 2;

        this.sideControlFillColor = '#fff';
        this.sideControlStrokeColor = '#4ba4f7';

        this.arrowWidth = Math.round(this.fontSize / 24 * 44);
        this.arrowHeight = Math.round(this.fontSize / 24 * 46);

        this.smallArrowWidth = Math.round(this.fontSize / 24 * 23);
        this.smallArrowHeight = Math.round(this.fontSize / 24 * 24);
        this.smallLineHeight = Math.round(this.fontSize / 24 * 60);
        this.smallLineWidth = Math.round(this.fontSize / 24 * 4);
        this.distanceGap = Math.round(this.fontSize / 24 * 15);
        this.limitWidth = Math.round(this.smallArrowWidth * 2);

        this.innerBlurWidth = Math.round(this.fontSize / 24 * 4);

        this.outerShadowWidth = Math.round(this.fontSize / 24 * 6);

        this.hangingLineWidth = Math.round(this.fontSize / 24 * 4);
        this.hangingDistance = Math.round(this.fontSize / 24 * 117);
        this.hangingBOxBorder = Math.round(this.fontSize / 24 * 3);
        this.hangingBoxWidth = Math.round(this.fontSize / 24 * 132);
        this.hangingBoxHeight = Math.round(this.fontSize / 24 * 90);

        this.editImageWidth = Math.round(this.fontSize / 24 * 64);

        this.leftDistanceShow = 0;
        this.rightDistanceShow = 0;
        this.distanceMargin = Math.round(this.fontSize / 24 * 50);

        this.disaggregationDefaultHeight = Math.round(this.fontSize / 24 * 175); // 默认的解集高度
        this.disaggregationDistanceHeight = Math.round(this.fontSize / 24 * 368); // 有距离显示的解集高度
        this.disaggregationBaseHeight = Math.round(this.fontSize / 24 * 15); // 解集底部离数轴y轴为0的高度
        this.disaggregationGap = Math.round(this.fontSize / 24 * 80); // 两个解集之间的高度差
        this.disaggregationPoints = [{
            value: 0,
            type: 0,
            isShow: false
        }, {
            value: 0,
            type: 0,
            isShow: false
        }, {
            value: 0,
            type: 0,
            isShow: false
        }]; // 解集数据集合
        return this;
    }

    setDefaultData(except, value) {
        this.centerValue = new Fraction(0);
        this.pointIndex = 0;
        this.fraction = false; // 是否为分数数轴
        this.noNumber = false; // 是否无数值编号
        this.unitLength = Math.round(this.fontSize / 24 * 100); // 单位长度
        this.unitValue = '1'; // 一格代表的数

        if (except && value !== undefined) {
            this[except] = value;
        }

    }

    destroy() {
        AppConfig._inst = null;
    }

}


export default AppConfig;