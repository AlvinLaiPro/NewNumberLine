import AppControl from './AppControl'
import {
    parseMath
} from 'jqmath'
let Fraction = require('fraction.js');

class basePoint {
    constructor(obj) {
        this.index = obj.index;
        this._value = obj.value;
        this.fraction = obj.fraction;

        this._show = false;
        this._showValue = false;
        this._showDistance = false;
        this._selected = false;
        this.outsideHide = false;
        this._originOutsideHideDistance = false;
        this._limitHideDistance = false;
        this.outsideHideDistance = false;
        this._showEdit = false;
        this.draw();
    }

    destroy() {
        let app = AppControl.getInst();
        app.GraphControl.menuContainer.addClass('hide_dom');
        this.showDistance ? this.showDistance = false : null;
        this.markPointGroup.belong = null;
        this.$box[0].belong = null;
        // this.editImage = null;
        this.markPointGroup.remove();
        this.$box.remove();
        this.distanceGroup.remove();
        this.textBox.remove();
    }

    draw() {

        this.markPointGroup = this.createSvgContent('point').addClass('markPointGroup').addClass('hide_dom');
        this.distanceGroup = this.createDistanceContent().addClass('hidden');
        this.$box = this.createDomContent().addClass('hide_dom');
        this.markPointGroup.belong = this;
        this.$box[0].belong = this;
        this.setPosition();

    }

    createDomContent() {

        let app = AppControl.getInst();
        let box = $('<div/>').addClass('rectBox');
        let span = $('<span/>');

        box.addClass(app.config.pointClassArr[this.index]);
        box.append(span);
        app.GraphControl.textBoxContainer.append(box);

        return box

    }

    createDistanceContent() {

        let app = AppControl.getInst();
        let startX = 0;
        let path = `M${startX} ${0 - app.config.smallArrowHeight/2} 
			A${app.config.smallArrowWidth * 1.5} ${app.config.smallArrowHeight/2 * 1.5} 0 0 0 ${startX + app.config.smallArrowWidth} 0
			A${app.config.smallArrowWidth * 1.5} ${app.config.smallArrowHeight/2 * 1.5} 0 0 0 ${startX} ${0 + app.config.smallArrowHeight/2}
			Q${startX} 0 ${startX + app.config.smallArrowHeight/4} 0 
			Q${startX} 0 ${startX} ${0 - app.config.smallArrowHeight/2}`;
        let leftArrow = app.GraphControl.svg.path({
            path: path,
            fill: app.config.pointColorArr[this.index]
        }).addClass('leftArrow smallArrow');
        let rightArrow = app.GraphControl.svg.path({
            path: path,
            fill: app.config.pointColorArr[this.index]
        }).addClass('rightArrow smallArrow');
        let leftLine = app.GraphControl.svg.line(0, -app.config.smallLineHeight / 2, 0, app.config.smallLineHeight / 2)
            .attr({
                fill: 'none',
                stroke: app.config.pointColorArr[this.index],
                strokeWidth: app.config.smallLineWidth
            }).addClass('leftLine');
        let rightLine = app.GraphControl.svg.line(0, -app.config.smallLineHeight / 2, 0, app.config.smallLineHeight / 2)
            .attr({
                fill: 'none',
                stroke: app.config.pointColorArr[this.index],
                strokeWidth: app.config.smallLineWidth
            }).addClass('rightLine');

        let centerLine = app.GraphControl.svg.line(-app.config.smallArrowWidth / 2, 0, app.config.smallArrowWidth / 2, 0)
            .attr({
                fill: 'none',
                stroke: app.config.pointColorArr[this.index],
                strokeWidth: app.config.smallLineWidth
            }).addClass('centerLine');
        let group = app.GraphControl.svg.g(centerLine, leftArrow, rightArrow, leftLine, rightLine).addClass('distanceGroup');

        app.GraphControl.canvas.add(group);
        this.textBox = $('<span />').addClass('textBox').addClass(app.config.pointClassArr[this.index]).addClass('hidden');

        if (this.fraction) {
            let distanceValue = this.value.abs().toFraction(true).split(' ').join('}{');
            this.textBox.html('$${' + distanceValue + '}$$');
            parseMath(this.textBox[0]);

            if (this.value.round(2).mod(1).valueOf() === 0) {
                this.textBox.removeClass('fraction');
            } else {
                this.textBox.addClass('fraction');
            }

        } else {
            let distanceValue = this.value.round(2).abs().valueOf();
            this.textBox.html(distanceValue);
        }

        app.GraphControl.textBoxContainer.append(this.textBox);

        return group

    }


    createSvgContent(type) {

        let app = AppControl.getInst();
        let line = app.GraphControl.svg.line(0, app.config.pointRadius, 0, app.config.hangingDistance).attr({
            fill: 'none',
            stroke: app.config.pointColorArr[this.index],
            strokeWidth: app.config.hangingLineWidth
        }).addClass('hangingLine');
        let point = app.GraphControl.svg.image(app.config.pointImageArr[this.index], 0, -app.config.pointImageWidth / 2, app.config.pointImageWidth, app.config.pointImageWidth)
            .data({
                type: type
            }).addClass('markPoint');
        let selectedPoint = app.GraphControl.svg.image(app.config.pointSelectedImageArr[this.index], 0, -app.config.pointSelectedImageWidth / 2, app.config.pointSelectedImageWidth, app.config.pointSelectedImageWidth)
            .data({
                type: type
            })
            .addClass('selectedMarkPoint');
        /* this.editImage = app.GraphControl.svg.image(app.config.pointEditImageArr[this.index], 0, -app.config.editImageWidth / 2, app.config.editImageWidth, app.config.editImageWidth)
             .data({
                 type: 'edit'
             }).addClass('editImage');*/

        let group = app.GraphControl.svg.g(line, point, selectedPoint /*, this.editImage*/ );

        // group.pointObj = this;
        line.addClass('hide_dom');
        app.GraphControl.canvas.add(group);

        return group;
    }

    changeZIndex() {
        let app = AppControl.getInst();

        this.markPointGroup.toFront(this.markPointGroup.parent());
        this.$box.appendTo(app.GraphControl.textBoxContainer);
        app.func._hideKeyboard();

    }


    getPosition() {

        let app = AppControl.getInst();
        return this.value.sub(app.config.centerValue).div(app.config.unitValue).mul(app.config.unitLength).round(2).valueOf()

    }

    setPosition(bool) {

        let app = AppControl.getInst();
        if (!app.GraphControl.getCurrentRange(this.value)) {
            this.outside = true;
            return;
        } else {
            this.outside = false;
        }
        let originPos = app.GraphControl.axisGroup.select('.originPoint');
        let pos = this.getPosition();
        let domValue;

        if (originPos) {
            originPos = +originPos.attr('cx');
            if (Math.abs(pos - originPos) < (+this.textBox.width() + app.config.limitWidth)) {
                this.showDistance = false;
            }
        } else {
            this.showDistance = false;
        }

        if (this.fraction) {
            domValue = new Fraction(this.value.valueOf()).toFraction(true).split(' ');
        } else {
            domValue = this.value.round(2).valueOf();
        }

        this.markPointGroup.children().map(el => {
            el.setPosition({
                x: pos
            })
        });
        this.$box.css({
            left: pos
        });

        if (this.fraction) {

            let text = domValue.join('}{');

            this.$box.find('span').html('$${' + text + '}$$');
            parseMath(this.$box.find('span')[0]);

            let prefix = this.$box.find('.fm-prefix-tight');

            if (prefix.length > 0) {
                prefix.html(prefix.html().replace('−', '-'));
            };

            let distanceValue = this.value.abs().toFraction(true).split(' ').join('}{');

            this.textBox.html('$${' + distanceValue + '}$$');
            parseMath(this.textBox[0]);

            if (this.value.round(2).mod(1).valueOf() === 0) {
                this.textBox.removeClass('fraction');
            } else {
                this.textBox.addClass('fraction');
            }

        } else {
            let distanceValue = this.value.round(2).abs().valueOf();

            this.textBox.html(distanceValue);
            this.$box.find('span').html(domValue);
        }
        this.showDistance ? this.updateDistanceContent(true) : null;

        if (!bool) {
            this.changeZIndex();
        }

    }


    get value() {
        return this._value
    }

    set value(val) {
        this._value = val;
        this.setPosition();
    }

    get showEdit() {
        return this._showEdit;
    }

    set showEdit(val) {
        this._showEdit = val;
        this.updateShowEdit(val);
    }

    updateShowEdit(val) {

        let app = AppControl.getInst();
        let y = this.$box.outerHeight();
        let x = this.getPosition();
        console.log(y);
        let editBtn = app.GraphControl.editBtn.addClass(app.config.pointClassArr[this.index]);
        if (val) {
            this.$box.addClass('active');
            editBtn.css({
                left: x,
                marginTop: y
            }).addClass('active');
        } else {
            this.$box.removeClass('active');
            editBtn.removeClass('active').removeClass(app.config.pointClassArr[this.index]);
        }
    }

    get show() {
        return this._show;
    }

    set show(val) {
        this._show = val;
        this.updateShow(val);
    }

    updateShow(val) {
        if (!this.outside && val) {
            this.markPointGroup.removeClass('hide_dom');
            this.changeZIndex();
        } else {
            this.markPointGroup.addClass('hide_dom');
            this.showDistance = false;
        }
        this.showValue = this.showValue;
        this.showDistance = this.showDistance;
    }

    get outside() {
        return this._outside;
    }

    set outside(val) {
        this._outside = val;
        if (val) {
            this.showDistance = false;
        }
        this.show = this.show;
    }

    get belong() {
        this._belong.selectedGroup = this;
        return this._belong;
    }

    set belong(val) {
        this._belong = val;
    }



    get selected() {
        return this._selected
    }

    set selected(val) {
        this._selected = val;
        this.updateSelected(val);
    }

    updateSelected(val) {
        if (val) {
            this.markPointGroup.addClass('active');
            this.changeZIndex();
        } else {
            this.markPointGroup.removeClass('active');
        }
    }

    get showValue() {
        return this._showValue
    }

    set showValue(val) {
        this._showValue = val;
        if ((!this.outside && this.show) && val) {
            this.updateShowValue(val);
        } else {
            this.updateShowValue(false);
        }
    }

    updateShowValue(val) {
        if (val) {
            this.$box.removeClass('hide_dom');
            this.markPointGroup.select('.hangingLine').removeClass('hide_dom');
        } else {
            this.$box.addClass('hide_dom');
            this.markPointGroup.select('.hangingLine').addClass('hide_dom');
        }

    }


    get showDistance() {
        return this._showDistance
    }

    set showDistance(val) {
        this._showDistance = val;
        if ((!this.outside && this.show) && val) {
            this.updateDistanceContent(val);
        } else {
            this.updateDistanceContent(false);
        }
    }


    updateDistanceContent(val) {

        let app = AppControl.getInst();


        if (val) {
            console.log('changedistance')
            let originPos = app.GraphControl.axisGroup.select('.originPoint');
            let pos = this.getPosition();
            let domValue;
            let offset = 0;
            let domOffset = 0;

            if (originPos) {
                originPos = +originPos.attr('cx');
            } else {
                this.showDistance = false;
                return;
            }

            if (pos > originPos) {
                if (Point.rightDistancePoint.indexOf(this) == -1 && app.config.rightDistanceShow == 3) {
                    this.showDistance = false;
                    return;
                }
                let index = Point.rightDistancePoint.indexOf(this) > -1 ?
                    Point.rightDistancePoint.indexOf(this) : app.config.rightDistanceShow;

                this.distanceGroup.select('.leftLine').setPosition({
                    x: originPos
                });
                this.distanceGroup.select('.leftArrow').transform('t ' + (originPos) + ' 0r180');

                this.distanceGroup.select('.rightLine').setPosition({
                    x: pos
                });
                this.distanceGroup.select('.rightArrow').transform('t ' + (pos - app.config.smallArrowWidth) + ' 0');
                this.distanceGroup.select('.centerLine').setPosition({
                    x1: originPos + app.config.smallArrowWidth / 2,
                    x2: pos - app.config.smallArrowWidth / 2
                });

                offset = -(app.config.distanceGap + app.config.smallLineHeight / 2) - (app.config.smallLineHeight + app.config.distanceMargin) * index;
                domOffset = (app.config.distanceGap + app.config.smallLineHeight / 2) + (app.config.smallLineHeight + app.config.distanceMargin) * index;

                Point.rightDistancePoint.indexOf(this) > -1 ? null : (Point.rightDistancePoint.push(this), app.config.rightDistanceShow++);
            } else {
                if (Point.leftDistancePoint.indexOf(this) == -1 && app.config.leftDistanceShow == 3) {
                    this.showDistance = false;
                    return;
                }
                let index = Point.leftDistancePoint.indexOf(this) > -1 ?
                    Point.leftDistancePoint.indexOf(this) : app.config.leftDistanceShow;

                this.distanceGroup.select('.leftLine').setPosition({
                    x: pos
                });
                this.distanceGroup.select('.leftArrow').transform('t ' + (pos) + ' 0r180');
                this.distanceGroup.select('.rightLine').setPosition({
                    x: originPos
                });
                this.distanceGroup.select('.rightArrow').transform('t ' + (originPos - app.config.smallArrowWidth) + ' 0');
                this.distanceGroup.select('.centerLine').setPosition({
                    x1: pos + app.config.smallArrowWidth / 2,
                    x2: originPos - app.config.smallArrowWidth / 2
                });

                offset = -(app.config.distanceGap + app.config.smallLineHeight / 2) - (app.config.smallLineHeight + app.config.distanceMargin) * index;
                domOffset = (app.config.distanceGap + app.config.smallLineHeight / 2) + (app.config.smallLineHeight + app.config.distanceMargin) * index;
                Point.leftDistancePoint.indexOf(this) > -1 ? null : (Point.leftDistancePoint.push(this), app.config.leftDistanceShow++);
            }

            this.distanceGroup.transform('t 0 ' + offset);
            this.textBox.css({
                left: (pos + originPos) / 2,
                bottom: domOffset + (this.textBox.hasClass('fraction') ? (this.textBox.height() / 2 - app.config.fontSize * 10 / 24) : this.textBox.height())
            });

            app.data.hasDistance = true;
            this.textBox.removeClass('hidden');
            this.distanceGroup.removeClass('hidden');

        } else {
            Point.leftDistancePoint.indexOf(this) > -1 && (Point.leftDistancePoint.splice(Point.leftDistancePoint.indexOf(this), 1), app.config.leftDistanceShow--);
            Point.rightDistancePoint.indexOf(this) > -1 && (Point.rightDistancePoint.splice(Point.rightDistancePoint.indexOf(this), 1), app.config.rightDistanceShow--);

            Point.leftDistancePoint.map((el, i) => {
                let offset = -(app.config.distanceGap + app.config.smallLineHeight / 2) - (app.config.smallLineHeight + app.config.distanceMargin) * i;
                let domOffset = (app.config.distanceGap + app.config.smallLineHeight / 2) + (app.config.smallLineHeight + app.config.distanceMargin) * i;

                el.distanceGroup.transform('t 0 ' + offset);
                el.textBox.css({
                    bottom: domOffset + (this.textBox.hasClass('fraction') ? (this.textBox.height() / 2 - app.config.fontSize * 10 / 24) : this.textBox.height())
                });
            });

            Point.rightDistancePoint.map((el, i) => {
                let offset = -(app.config.distanceGap + app.config.smallLineHeight / 2) - (app.config.smallLineHeight + app.config.distanceMargin) * i;
                let domOffset = (app.config.distanceGap + app.config.smallLineHeight / 2) + (app.config.smallLineHeight + app.config.distanceMargin) * i;

                el.distanceGroup.transform('t 0 ' + offset);
                el.textBox.css({
                    bottom: domOffset + (this.textBox.hasClass('fraction') ? (this.textBox.height() / 2 - app.config.fontSize * 10 / 24) : this.textBox.height())
                });
            });

            if (Point.leftDistancePoint.length == 0 && Point.rightDistancePoint.length == 0) {
                app.data.hasDistance = false;
            }

            this.textBox.addClass('hidden');
            this.distanceGroup.addClass('hidden');
        }
    }

}

class Point {

    // static totalPoint = 0;

    constructor(obj) {

        this.pointGroup = new basePoint(obj);
        obj.value = obj.value.neg();
        this.negPointGroup = new basePoint(obj);
        this.pointGroup.linkGroup = this.negPointGroup;
        this.negPointGroup.linkGroup = this.pointGroup;
        this.pointGroup.belong = this;
        this.negPointGroup.belong = this;
        this.selectedGroup = this.pointGroup;
        this._value = null;
        this._selected = false;
        this._showShadow = false;
        this._showDistance = false;
        this.pointGroup.show = true;
        this._showEdit = false;
        Point.totalPoint++;

    }

    destroy() {

        let app = AppControl.getInst();
        let index = app.data.pointArr.indexOf(this);

        this.pointGroup.linkGroup = null;
        this.negPointGroup.linkGroup = null;
        this.pointGroup.belong = null;
        this.negPointGroup.belong = null;
        this.selectedGroup = null;
        this.pointGroup.destroy();
        this.negPointGroup.destroy();
        app.data.pointArr.splice(index, 1);
        Point.totalPoint--;
    }

    get value() {
        return this._value;
    }

    set value(val) {

        let app = AppControl.getInst();
        if (Point.rightDistancePoint.indexOf(this.selectedGroup) > -1 || Point.leftDistancePoint.indexOf(this.selectedGroup) > -1) {
            this.selectedGroup.updateDistanceContent(false);
        };
        if (Point.rightDistancePoint.indexOf(this.selectedGroup.linkGroup) > -1 || Point.leftDistancePoint.indexOf(this.selectedGroup.linkGroup) > -1) {
            this.selectedGroup.linkGroup.updateDistanceContent(false);
        };

        this.selectedGroup.linkGroup.fraction = val.fraction;
        this.selectedGroup.linkGroup.value = val.value.neg();
        this.selectedGroup.fraction = val.fraction;
        this.selectedGroup.value = val.value;
    }

    get selected() {
        return this._selected;
    }

    set selected(val) {
        this._selected = val;
        this.updateSelected(val);
    }


    get showEdit() {
        return this._showEdit;
    }

    set showEdit(val) {
        this._showEdit = val;
        this.updateshowEdit(val);
    }

    updateshowEdit(val) {
        this.selectedGroup.showEdit = val;
    }

    get showValue() {
        return this.selectedGroup._showValue;
    }

    set showValue(val) {
        this.selectedGroup.showValue = val;
        this.selectedGroup.linkGroup.show && (this.selectedGroup.linkGroup.showValue = val);
    }

    get showShadow() {
        return this.selectedGroup.linkGroup._show;
    }

    set showShadow(val) {
        this.updateShowShadow(val);
    }

    get showDistance() {
        return this.selectedGroup.showDistance;
    }

    set showDistance(val) {
        this.selectedGroup.showDistance = val;
        (!this.selectedGroup.linkGroup.outside && this.selectedGroup.linkGroup.show) && (this.selectedGroup.linkGroup.showDistance = val);
    }

    setPosition(bool = false) {
        this.pointGroup.setPosition(bool);
        this.negPointGroup.setPosition(bool);
    }

    updateSelected(val) {
        this.selectedGroup.linkGroup.show && (this.selectedGroup.linkGroup.selected = val);
        this.selectedGroup.selected = val;
        this.updateMenu(val);
    }

    updateShowShadow(val) {
        let app = AppControl.getInst();
        let group = this.selectedGroup.linkGroup;
        if (val) {
            if (!app.GraphControl.getCurrentRange(group.value)) {
                group.showValue = this.selectedGroup.showValue;
                group.showDistance = false;
                group.show = val;
            } else {
                group.showValue = this.selectedGroup.showValue;
                group.showDistance = this.selectedGroup.showDistance;
                group.show = val;
            }
        } else {
            group.show = val;
        }
    }


    updateMenu(val) {
        let app = AppControl.getInst();

        if (!val) {
            app.GraphControl.menuContainer.addClass('hide_dom');
            return
        }
        let group = this.selectedGroup;
        let originPoint = app.GraphControl.axisGroup.select('.originPoint');
        let pos = group.getPosition();

        if (originPoint) {

            if (Math.abs(pos - +originPoint.attr('cx')) < (+group.textBox.width() + app.config.limitWidth)) {
                console.log('shortHideDistance')
                app.GraphControl.menuContainer.find('.distance').addClass('ui_btn_disabled');
            } else {
                app.GraphControl.menuContainer.find('.distance').removeClass('ui_btn_disabled');
                if (group.showDistance) {
                    app.GraphControl.menuContainer.find('.distance').addClass('current');
                } else {
                    app.GraphControl.menuContainer.find('.distance').removeClass('current');
                }
            }

        } else {
            app.GraphControl.menuContainer.find('.distance').addClass('ui_btn_disabled');
        }

        if (group.linkGroup.show) {
            app.GraphControl.menuContainer.find('.shadow').addClass('current');
        } else {
            app.GraphControl.menuContainer.find('.shadow').removeClass('current');
        }

        if (this.showValue) {
            app.GraphControl.menuContainer.find('.showValue').addClass('current');
        } else {
            app.GraphControl.menuContainer.find('.showValue').removeClass('current');
        }

        let halfMenuWidth = app.GraphControl.menuContainer.find('.ui_btn_round').width() / 2;

        if (pos < 0) {
            if (pos - halfMenuWidth < -app.GraphControl.svgWidth / 2) {
                pos = -app.GraphControl.svgWidth / 2 + halfMenuWidth + 2
            }
        } else {
            if (pos + halfMenuWidth > app.GraphControl.svgWidth / 2) {
                pos = app.GraphControl.svgWidth / 2 - halfMenuWidth - 2
            }
        }

        if (group.value.compare(0) < 0) {
            if (app.config.leftDistanceShow == 3 && Point.leftDistancePoint.indexOf(group) == -1) {
                app.GraphControl.menuContainer.find('.distance').addClass('ui_btn_disabled');
            }
        } else {
            if (app.config.rightDistanceShow == 3 && Point.rightDistancePoint.indexOf(group) == -1) {
                app.GraphControl.menuContainer.find('.distance').addClass('ui_btn_disabled');
            }
        }

        app.GraphControl.menuContainer.css({
            left: pos
        }).removeClass('hide_dom');
    }

};

Point.totalPoint = 0;
Point.leftDistancePoint = [];
Point.rightDistancePoint = [];

export {
    Point as
    default
};