import BaseControl from "./BaseControl";
import GraphControl from "./GraphControl";
import Point from "./Point";
import {
    parseMath
} from 'jqmath'
let Fraction = require('fraction.js');

export default class DisaggregationControl extends BaseControl {
    /**
     * 单例
     */
    static _inst;

    static getInst() {
        DisaggregationControl._inst = DisaggregationControl._inst || new DisaggregationControl();
        return DisaggregationControl._inst;
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
        this.svg = this.app.GraphControl.svg;
        this.canvas = this.app.GraphControl.canvas;
        this.pointsMap = this.app.config.disaggregationPoints;
        this.tag = null;
        this.drawDisaggregation();
        return this;
    }


    /**
     * 绘制解集
     */
    drawDisaggregation() {
        // this.group = this.svg.g().addClass('disaggregation');
        this.greenGroup = this.svg.g().addClass('greenGroup').addClass('hide_dom');
        this.pinkGroup = this.svg.g().addClass('pinkGroup').addClass('hide_dom');
        this.blueGroup = this.svg.g().addClass('blueGroup').addClass('hide_dom');
        this.greenHollowGroup = this.svg.g().addClass('greenHollowGroup').attr({
            tag: 0
        });
        this.greenFullGroup = this.svg.g().addClass('greenFullGroup').attr({
            tag: 0
        });
        this.pinkHollowGroup = this.svg.g().addClass('pinkHollowGroup').attr({
            tag: 1
        });
        this.pinkFullGroup = this.svg.g().addClass('pinkFullGroup').attr({
            tag: 1
        });
        this.blueHollowGroup = this.svg.g().addClass('blueHollowGroup').attr({
            tag: 2
        });
        this.blueFullGroup = this.svg.g().addClass('blueFullGroup').attr({
            tag: 2
        });

        // 绿色空洞
        this.greenHollow = this.drawDisaggregationPoint('resources/images/hollowrange-green.png').addClass('hollowPoint ');
        // 绿色实洞
        this.greenFull = this.drawDisaggregationPoint('resources/images/fullrange-green.png').addClass('fullPoint ');
        // 绿色空洞选中
        this.greenHollowActive = this.drawDisaggregationPoint('resources/images/hollowrange-green-active.png').addClass('hollowPointActive');
        // 绿色实洞选中
        this.greenFullActive = this.drawDisaggregationPoint('resources/images/fullrange-green-active.png').addClass('fullPointActive');
        // 红色空洞
        this.pinkHollow = this.drawDisaggregationPoint('resources/images/hollowrange-red.png').addClass('hollowPoint ');
        // 红色实洞
        this.pinkFull = this.drawDisaggregationPoint('resources/images/fullrange-red.png').addClass('fullPoint ');
        // 红色空洞选中
        this.pinkHollowActive = this.drawDisaggregationPoint('resources/images/hollowrange-red-active.png').addClass('hollowPointActive');
        // 红色实洞选中
        this.pinkFullActive = this.drawDisaggregationPoint('resources/images/fullrange-red-active.png').addClass('fullPointActive');
        // 蓝色空洞
        this.blueHollow = this.drawDisaggregationPoint('resources/images/hollowrange-blue.png').addClass('hollowPoint ');
        // 蓝色实洞
        this.blueFull = this.drawDisaggregationPoint('resources/images/markyellow.png').addClass('fullPoint ');
        // 蓝色空洞选中
        this.blueHollowActive = this.drawDisaggregationPoint('resources/images/hollowrange-blue-active.png').addClass('hollowPointActive');
        // 蓝色实洞选中
        this.blueFullActive = this.drawDisaggregationPoint('resources/images/markyellow-on.png').addClass('fullPointActive');
        // 绿色垂直线
        this.greenV = this.drawDisaggregationLine(this.app.config.pointColorArr[0]).addClass('verticalLine').attr({
            strokeLinecap: 'round'
        });
        // 绿色水平线
        this.greenH = this.drawDisaggregationLine(this.app.config.pointColorArr[0]).addClass('horizontalLine').attr({
            strokeLinecap: 'round'
        });
        this.downGreenV = this.drawDisaggregationLine(this.app.config.pointColorArr[0]).addClass('downVerticalLine');
        // 红色垂直线
        this.pinkV = this.drawDisaggregationLine(this.app.config.pointColorArr[1]).addClass('verticalLine').attr({
            strokeLinecap: 'round'
        });

        this.downpinkV = this.drawDisaggregationLine(this.app.config.pointColorArr[1]).addClass('downVerticalLine');
        // 红色水平线
        this.pinkH = this.drawDisaggregationLine(this.app.config.pointColorArr[1]).addClass('horizontalLine').attr({
            strokeLinecap: 'round'
        });
        // 蓝色垂直线
        this.blueV = this.drawDisaggregationLine(this.app.config.pointColorArr[2]).addClass('verticalLine').attr({
            strokeLinecap: 'round'
        });
        // 蓝色水平线
        this.blueH = this.drawDisaggregationLine(this.app.config.pointColorArr[2]).addClass('horizontalLine').attr({
            strokeLinecap: 'round'
        });
        this.downBlueV = this.drawDisaggregationLine(this.app.config.pointColorArr[2]).addClass('downVerticalLine');
        // 解集
        this.pattern = this.svg.image(this.app.config.basePath + 'resources/images/pattern.png', 0, 0,
                parseInt(60 * this.app.config.fontSize / 24), parseInt(60 * this.app.config.fontSize / 24))
            .pattern(0, 0, parseInt(60 * this.app.config.fontSize / 24), parseInt(60 * this.app.config.fontSize / 24)).attr({
                patternTransform: 'rotate(-45)'
            });

        this.disaggregationGroup = this.svg.rect(0, 0, 0, 0).attr({
            fill: this.pattern
        }).addClass('patternRect');

        this.greenHollowGroup.add(this.greenHollow, this.greenHollowActive);
        this.greenFullGroup.add(this.greenFull, this.greenFullActive);
        this.pinkHollowGroup.add(this.pinkHollow, this.pinkHollowActive);
        this.pinkFullGroup.add(this.pinkFull, this.pinkFullActive);
        this.blueHollowGroup.add(this.blueHollow, this.blueHollowActive);
        this.blueFullGroup.add(this.blueFull, this.blueFullActive);

        this.greenGroup.add(this.greenV, this.greenH, this.downGreenV, this.greenHollowGroup, this.greenFullGroup);
        this.pinkGroup.add(this.pinkV, this.pinkH, this.downpinkV, this.pinkHollowGroup, this.pinkFullGroup);
        this.blueGroup.add(this.blueV, this.blueH, this.downBlueV, this.blueHollowGroup, this.blueFullGroup);

        this.canvas.add(this.disaggregationGroup, this.greenGroup, this.pinkGroup, this.blueGroup);
        // this.canvas.insertAfter(this.canvas.select('.axisGroup'));

        this.$greenBox = this.createDomContent(0).addClass('hide_dom');
        this.$pinkBox = this.createDomContent(1).addClass('hide_dom');
        this.$blueBox = this.createDomContent(2).addClass('hide_dom');
    }

    // 创建解集点
    drawDisaggregationPoint(url) {
        let img = this.svg.image(this.app.config.basePath + url, 0, 0,
            parseInt(40 * this.app.config.fontSize / 24), parseInt(40 * this.app.config.fontSize / 24)).attr({
            x: -parseInt(40 * this.app.config.fontSize / 24) / 2,
            y: -parseInt(40 * this.app.config.fontSize / 24) / 2
        }).data({
            type: 'disaggregation'
        });

        return img;
    }

    // 创建解集线
    drawDisaggregationLine(color) {
        let line = this.svg.line(0, 0, 0, 0).attr({
            fill: 'none',
            stroke: color,
            strokeWidth: this.app.config.unitWidth
        });

        return line;
    }

    createDomContent(index) {
        let box = $('<div/>').addClass('rectBox solution');
        let span = $('<span/>');
        box.addClass(this.app.config.pointClassArr[index]);
        box.append(span);
        this.app.GraphControl.textBoxContainer.append(box);

        return box
    }

    updateDomContent($box, value, left, isFraction) {
        let span = $box.find('span');
        if (isFraction) {
            let domValue = value.toFraction(true).split(' ').join('}{');
            span.html('$${' + domValue + '}$$');
            parseMath(span[0]);
        } else {
            let domValue = value.round(2).valueOf();
            span.html(domValue);
        }

        $box.css({
            left
        })

    }

    changeZIndex(type) {
        let group = this[type + 'Group'];
        let $box = this['$' + type + 'Box'];

        group.toFront(group.parent());
        $box.appendTo(this.app.GraphControl.textBoxContainer);
        this.app.func._hideKeyboard();
    }

    // 更新解集
    updateDisaggregation() {
        if (this.app.data.solutionSet === 0) return;
        let disShows = [0, 1, 2];
        let curHeight = this.app.data.hasDistance ? new Fraction(this.app.config.disaggregationDistanceHeight).valueOf() :
            new Fraction(this.app.config.disaggregationDefaultHeight).valueOf();

        let arr = disShows.filter((ele) => {
            return this.pointsMap[ele].isShow;
        });
        switch (arr.length) {
            case 1:
                this._oneDisaggregation(arr[0], curHeight);
                break;
            case 2:

                this._twoDisaggregation(arr[0], arr[1], curHeight);
                break;
            case 3:
                this._allDisaggregation(curHeight);
                break;
            default:
                this._hideAllDisaggregation();
        }
    }

    //一个解集
    _oneDisaggregation(index, height) {
        let division = new Fraction(this.app.config.leftDivision).valueOf();
        let unitValue = new Fraction(this.app.config.unitValue).valueOf();
        let unitLength = new Fraction(this.app.config.unitLength).valueOf();
        let value = new Fraction(this.pointsMap[index].value).sub(this.app.config.centerValue).valueOf();
        let rate = value / unitValue;
        let length = this.pointsMap[index].type > 2 ? division - rate : -(rate + division);
        switch (index) {
            case 0:
                this.updateLine(this.greenGroup, length, height, rate * unitLength, this.pointsMap[0].type);
                this.pinkGroup.addClass('hide_dom');
                this.$pinkBox.addClass('hide_dom');
                this.blueGroup.addClass('hide_dom');
                this.$blueBox.addClass('hide_dom');
                break;
            case 1:
                this.updateLine(this.pinkGroup, length, height, rate * unitLength, this.pointsMap[1].type);
                this.greenGroup.addClass('hide_dom');
                this.$greenBox.addClass('hide_dom');
                this.blueGroup.addClass('hide_dom');
                this.$blueBox.addClass('hide_dom');
                break;
            case 2:
                this.updateLine(this.blueGroup, length, height, rate * unitLength, this.pointsMap[2].type);
                this.greenGroup.addClass('hide_dom');
                this.$greenBox.addClass('hide_dom');
                this.pinkGroup.addClass('hide_dom');
                this.$pinkBox.addClass('hide_dom');
        }
        this.disaggregationGroup.addClass('hide_dom');
    }

    _twoDisaggregation(index1, index2, height) {
        this._hideAllDisaggregation();
        let disaggregationLength = 0; //公共解集的长度
        let division = new Fraction(this.app.config.leftDivision).valueOf();
        let unitValue = new Fraction(this.app.config.unitValue).valueOf();
        let unitLength = new Fraction(this.app.config.unitLength).valueOf();
        let value1 = new Fraction(this.pointsMap[index1].value).sub(this.app.config.centerValue).valueOf();
        let value2 = new Fraction(this.pointsMap[index2].value).sub(this.app.config.centerValue).valueOf();
        let Gap = new Fraction(this.app.config.disaggregationGap).valueOf();
        let rate1 = value1 / unitValue;
        let rate2 = value2 / unitValue;
        let greenLength = 0;
        let pinkLength = 0;
        let disaggregationStart = 0;
        if (this.pointsMap[index1].type === 1 || this.pointsMap[index1].type === 2) {
            // 两个解集都是小于
            if (this.pointsMap[index2].type === 1 || this.pointsMap[index2].type === 2) {
                greenLength = -Math.abs(rate1 + division);
                pinkLength = -Math.abs(rate2 + division);
                if (value1 <= value2) {
                    disaggregationLength = rate1 + division;
                } else {
                    disaggregationLength = rate2 + division;
                }
                disaggregationStart = -division * unitLength;
            } else {
                if (value1 > value2) {
                    disaggregationLength = rate1 - rate2;
                    disaggregationStart = rate2 * unitLength;
                } else {
                    disaggregationLength = 0;
                    disaggregationStart = 0;
                }
                greenLength = -(division + rate1);
                pinkLength = division - rate2;
            }
        } else {
            // 两个解集一大一小
            if (this.pointsMap[index2].type === 1 || this.pointsMap[index2].type === 2) {
                if (value2 > value1) {
                    disaggregationLength = rate2 - rate1;
                    disaggregationStart = rate1 * unitLength;
                } else {
                    disaggregationLength = 0;
                    disaggregationStart = 0;
                }
                greenLength = division - rate1;
                pinkLength = -(division + rate2);
            } else {
                greenLength = Math.abs(division - rate1);
                pinkLength = Math.abs(division - rate2);
                if (value1 <= value2) {
                    disaggregationLength = division - rate2;
                    disaggregationStart = rate2 * unitLength;
                } else {
                    disaggregationLength = division - rate1;
                    disaggregationStart = rate1 * unitLength;
                }
            }
        }
        this.updateLine(this._getGroup(index1), greenLength, height, rate1 * unitLength, this.pointsMap[index1].type);
        this.updateLine(this._getGroup(index2), pinkLength, height + Gap, rate2 * unitLength, this.pointsMap[index2].type);
        this.updateDisaggregationArea(disaggregationStart, -height - Gap, disaggregationLength * unitLength, Gap, this.pointsMap);

        this.disaggregationGroup.removeClass('hide_dom');
    }

    _getGroup(index) {
        switch (index) {
            case 0:
                return this.greenGroup;
            case 1:
                return this.pinkGroup;
            case 2:
                return this.blueGroup;
        }
    }

    _allDisaggregation(height) {
        let disaggregationLength = 0; //公共解集的长度
        let division = new Fraction(this.app.config.leftDivision).valueOf();
        let unitValue = new Fraction(this.app.config.unitValue).valueOf();
        let unitLength = new Fraction(this.app.config.unitLength).valueOf();
        let value1 = new Fraction(this.pointsMap[0].value).sub(this.app.config.centerValue).valueOf();
        let value2 = new Fraction(this.pointsMap[1].value).sub(this.app.config.centerValue).valueOf();
        let value3 = new Fraction(this.pointsMap[2].value).sub(this.app.config.centerValue).valueOf();
        let Gap = new Fraction(this.app.config.disaggregationGap).valueOf();
        let rate1 = value1 / unitValue;
        let rate2 = value2 / unitValue;
        let rate3 = value3 / unitValue;
        let greenLength = 0;
        let pinkLength = 0;
        let blueLength = 0;
        let disaggregationStart = 0;
        if (this.pointsMap[0].type === 1 || this.pointsMap[0].type === 2) {
            greenLength = -(division + rate1);
            if (this.pointsMap[1].type === 1 || this.pointsMap[1].type === 2) {
                pinkLength = -(rate2 + division);
                //三个解集都是小于或小等于
                if (this.pointsMap[2].type === 1 || this.pointsMap[2].type === 2) {
                    blueLength = -(rate3 + division);
                    if (value1 <= value2 && value1 <= value3) {
                        disaggregationLength = rate1 + division;
                    } else if (value2 <= value1 && value2 <= value3) {
                        disaggregationLength = rate2 + division;
                    } else {
                        disaggregationLength = rate3 + division;
                    }
                    disaggregationStart = -division * unitLength;
                } else {
                    blueLength = division - rate3;
                    if (value3 > value2 || value3 > value1) {
                        disaggregationLength = 0;
                        disaggregationStart = 0;
                    } else {
                        disaggregationStart = rate3 * unitLength;
                        disaggregationLength = value1 <= value2 ? rate1 - rate3 : rate2 - rate3;
                    }
                }
            } else {
                pinkLength = division - rate2;
                //假设没有解集
                disaggregationLength = 0;
                disaggregationStart = 0;

                if (this.pointsMap[2].type === 1 || this.pointsMap[2].type === 2) {
                    blueLength = -(rate3 + division);
                    if (value1 > value2) {
                        if (value3 >= value2 && value3 <= value1) {
                            disaggregationLength = rate3 - rate2;
                            disaggregationStart = rate2 * unitLength;
                        } else if (value3 > value1) {
                            disaggregationLength = rate1 - rate2;
                            disaggregationStart = rate2 * unitLength;
                        }
                    }
                } else {
                    blueLength = division - rate3;
                    if (value1 > value2) {
                        if (value3 >= value2 && value3 <= value1) {
                            disaggregationLength = rate1 - rate3;
                            disaggregationStart = rate3 * unitLength;
                        } else if (value3 < value2) {
                            disaggregationLength = rate1 - rate2;
                            disaggregationStart = rate2 * unitLength;
                        }
                    }
                }
            }
        } else {
            greenLength = division - rate1;
            if (this.pointsMap[1].type === 1 || this.pointsMap[1].type === 2) {
                pinkLength = -(division + rate2);
                //假设没有解集
                disaggregationLength = 0;
                disaggregationStart = 0;

                if (this.pointsMap[2].type === 1 || this.pointsMap[2].type === 2) {
                    blueLength = -(rate3 + division);
                    if (value2 > value1) {
                        if (value3 >= value1 && value3 <= value2) {
                            disaggregationLength = rate3 - rate1;
                            disaggregationStart = rate1 * unitLength;
                        } else if (value3 > value2) {
                            disaggregationLength = rate2 - rate1;
                            disaggregationStart = rate1 * unitLength;
                        }
                    }
                } else {
                    blueLength = division - rate3;
                    if (value2 > value1) {
                        if (value3 >= value1 && value3 <= value2) {
                            disaggregationLength = rate2 - rate3;
                            disaggregationStart = rate3 * unitLength;
                        } else if (value3 < value1) {
                            disaggregationLength = rate2 - rate1;
                            disaggregationStart = rate1 * unitLength;
                        }
                    }
                }
            } else {
                pinkLength = division - rate2;
                //三个解集都是大于或者大等于
                if (this.pointsMap[2].type === 3 || this.pointsMap[2].type === 4) {
                    blueLength = division - rate3;
                    if (value1 >= value2 && value1 >= value3) {
                        disaggregationStart = rate1 * unitLength;
                        disaggregationLength = division - rate1;
                    } else if (value2 >= value1 && value2 >= value3) {
                        disaggregationStart = rate2 * unitLength;
                        disaggregationLength = division - rate2;
                    } else {
                        disaggregationStart = rate3 * unitLength;
                        disaggregationLength = division - rate3;
                    }
                } else {
                    blueLength = -(rate3 + division);
                    if (value3 <= value2 || value3 <= value1) {
                        disaggregationLength = 0;
                        disaggregationStart = 0;
                    } else {
                        if (value1 <= value2) {
                            disaggregationStart = rate2 * unitLength;
                            disaggregationLength = rate3 - rate2;
                        } else {
                            disaggregationStart = rate1 * unitLength;
                            disaggregationLength = rate3 - rate1;
                        }
                    }
                }
            }
        }
        this.updateLine(this.greenGroup, greenLength, height, rate1 * unitLength, this.pointsMap[0].type);
        this.updateLine(this.pinkGroup, pinkLength, height + Gap, rate2 * unitLength, this.pointsMap[1].type);
        this.updateLine(this.blueGroup, blueLength, height + 2 * Gap, rate3 * unitLength, this.pointsMap[2].type);
        this.updateDisaggregationArea(disaggregationStart, -height - 2 * Gap, disaggregationLength * unitLength, 2 * Gap, this.pointsMap);
        this.greenGroup.removeClass('hide_dom');
        this.pinkGroup.removeClass('hide_dom');
        this.blueGroup.removeClass('hide_dom');
        this.$pinkBox.removeClass('hide_dom');
        this.$greenBox.removeClass('hide_dom');
        this.$blueBox.removeClass('hide_dom');
        this.disaggregationGroup.removeClass('hide_dom');
    }

    _hideAllDisaggregation() {
        this.greenGroup.addClass('hide_dom');
        this.pinkGroup.addClass('hide_dom');
        this.blueGroup.addClass('hide_dom');
        this.$pinkBox.addClass('hide_dom');
        this.$greenBox.addClass('hide_dom');
        this.$blueBox.addClass('hide_dom');
        this.disaggregationGroup.addClass('hide_dom');
    }

    // 更新相交区域
    updateDisaggregationArea(x, y, width, height, map) {
        let disShows = [0, 1, 2];
        let arr = disShows.filter((ele) => {
            return this.pointsMap[ele].isShow;
        });
        if (!map || arr.length < 2) {
            width = 0;
        }
        width = new Fraction(width).round(2).valueOf();
        this.disaggregationGroup.attr({
            x,
            y,
            width,
            height
        });
    }

    // 更新解集线和点
    updateLine(group, len, height, x, type) {
        let value, $box, isFraction;
        if (group.hasClass('greenGroup')) {
            isFraction = typeof this.pointsMap[0].value === 'string' || this.app.config.fraction;
            value = new Fraction(this.pointsMap[0].value);
            $box = this.$greenBox;
        } else if (group.hasClass('pinkGroup')) {
            isFraction = typeof this.pointsMap[1].value === 'string' || this.app.config.fraction;
            value = new Fraction(this.pointsMap[1].value);
            $box = this.$pinkBox;
        } else {
            isFraction = typeof this.pointsMap[2].value === 'string' || this.app.config.fraction;
            value = new Fraction(this.pointsMap[2].value);
            $box = this.$blueBox;
        }


        let offsetY = this.app.config.disaggregationBaseHeight;
        let verticalLine = group.select('.verticalLine');
        let horizontalLine = group.select('.horizontalLine');
        let downVerticalLine = group.select('.downVerticalLine');
        this.updateDisaggregationLine(verticalLine, x, -offsetY, x, -height);
        this.updateDisaggregationLine(downVerticalLine, x, offsetY, x, this.app.config.hangingDistance);
        this.updateDisaggregationLine(horizontalLine, x, -height, x + len * this.app.config.unitLength, -height);
        this.updateDisaggregationPoint(group, x, type);
        this.updateDomContent($box, value, x, isFraction);
        $box.removeClass('hide_dom');
        group.removeClass('hide_dom');
    }

    // 更新解集点
    updateDisaggregationPoint(group, x, type) {
        let hollowPoint = group.select('.hollowPoint');
        let fullPoint = group.select('.fullPoint');
        let hollowPointActive = group.select('.hollowPointActive');
        let fullPointActive = group.select('.fullPointActive');
        switch (type) {
            case 1:
            case 4:
                hollowPoint.removeClass('hide_dom');
                fullPoint.addClass('hide_dom');
                break;
            case 2:
            case 3:
                fullPoint.removeClass('hide_dom');
                hollowPoint.addClass('hide_dom');
                break;
        }
        hollowPoint.attr({
            x: x - parseInt(40 * this.app.config.fontSize / 24) / 2
        });
        fullPoint.attr({
            x: x - parseInt(40 * this.app.config.fontSize / 24) / 2
        });
        hollowPointActive.attr({
            x: x - parseInt(40 * this.app.config.fontSize / 24) / 2
        });
        fullPointActive.attr({
            x: x - parseInt(40 * this.app.config.fontSize / 24) / 2
        });
        // group.toFront(this.canvas);
    }

    // 更新解集线
    updateDisaggregationLine(line, x1, y1, x2, y2) {
        line.attr({
            x1,
            y1,
            x2,
            y2
        });
        return line;
    }

    // 删除
    destroy() {
        if (this.tag && this.tag > 2) return;
        if (this.tag === 0) {
            this.greenHollowGroup.removeClass('active');
            this.greenFullGroup.removeClass('active');
        } else if (this.tag === 1) {
            this.pinkHollowGroup.removeClass('active');
            this.pinkFullGroup.removeClass('active');
        } else if (this.tag === 2) {
            this.blueHollowGroup.removeClass('active');
            this.blueFullGroup.removeClass('active');
        }
        this.pointsMap[this.tag].isShow = false;
        this.updateDisaggregation();
        this.tag = null;
        this.app.data.solutionSet -= 1;
    }

    // 清空
    clear() {
        let points = this.app.config.disaggregationPoints;
        for (let i = 0, len = points.length; i < len; i++) {
            points[i].isShow = false;
        }
        this.greenHollowGroup.removeClass('active');
        this.greenFullGroup.removeClass('active');
        this.pinkHollowGroup.removeClass('active');
        this.pinkFullGroup.removeClass('active');
        this.blueHollowGroup.removeClass('active');
        this.blueFullGroup.removeClass('active');
        this.updateDisaggregation();
        this.tag = null;
        this.app.data.solutionSet = 0;
    }

    /**
     * 析构
     */
    destroyAll() {
        DisaggregationControl._inst = null;
    }
}