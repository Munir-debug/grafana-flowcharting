export default class State  {
    /** @ngInject */
    constructor(cell,graph) {
      this.cell = cell;
      this.graph = graph;
      this.cellId = cell.id;
      this.matched = false;
      this.matchedShape = false;
      this.matchedText = false;
      this.matchedLink = false;
      this.globalLevel = -1;
      this.styles = ["fillColor", "strokeColor", "fontColor"]
      this.level = {
        fillColor : -1,
        strokeColor : -1,
        fontColor : -1
      }
      this.currentColors = {
        fillColor : cell.style["fillColor"],
        strokeColor : cell.style["strokeColor"],
        fontColor : cell.style["fontColor"]
      }
      this.originalColors = {
        fillColor : cell.style["fillColor"],
        strokeColor : cell.style["strokeColor"],
        fontColor : cell.style["fontColor"]
      }
      this.originalValue = cell.getValue();
      this.currentValue = cell.getValue();
      this.originalLink = cell.getAttribute("link");
      this.currentLink = cell.getAttribute("link");
    }

    setState(rule,serie) {
      if(rule.matchSerie(serie)) {
        let shapeMaps = rule.getShapeMaps();
        let textMaps = rule.getTextMaps();
        let linkMaps = rule.getTextMaps();
        let value = rule.getValueForSerie(serie);
        let FormattedValue = rule.getFormattedValue(value);
        let level = rule.getThresholdLevel(value);
        //SHAPE
        let cellProp = this.getCellProp(rule.shapeProp);
        shapeMaps.forEach(shape => {
          if (  !shape.isHidden() && shape.match(cellProp)) {
            this.matchedShape = true;
            this.matched = true;
            if (this.globalLevel <= level) {
              this.setLevelStyle(rule.style,level);
              if(rule.toColorize()) {
                this.setColorStyle(rule.style, rule.getColorForValue(value));
              }
            }
          }
        });
        //TEXT
        cellProp = this.getCellProp(rule.textProp);
        textMaps.forEach(text => {
          if ( !text.isHidden() && text.match(cellProp))
          {
            this.matchedText = true;
            this.matched = true;
            if (this.globalLevel <= level) {
              this.setText(rule.getReplaceText(this.originalValue,FormattedValue))
            }
          }
        });
        // LINK
        cellProp = this.getCellProp(rule.linkProp);
        linkMaps.forEach(link => {
          if ( !link.isHidden() && link.match(cellProp)) {
            this.matchedLink = true;
            this.matched = true;

          }
        });

      }
    }

    unsetState() {
      this.unsetLevel();
      this.unsetColor();
      this.unsetText();
      this.unsetLink();
      this.matched = false;
      this.matchedShape = false;
      this.matchedText = false;
      this.matchedLink = false;
    }

    getCellProp(prop) {
      if( prop === "id"    ) return this.cellId;
      if( prop === "value" ) return this.originalValue;
    }

    setColorStyle(style,color) {
      this.currentColors[style] = color;
      // this.graph.setCellStyles(style, color, [this.cell]);
    }

    unsetColorStyle(style) {
      let color = this.originalColors[style];
      this.currentColors[style] = color;
      // this.graph.setCellStyles(style, color, [this.cell]);
    }

    unsetColor() {
      this.styles.forEach(style => {
        this.unsetColorStyle(style);
      });
    }

    getCurrentColorStyle(style) {
      return this.currentColors[style];
    }

    unsetLevelStyle(style) {
      this.level[style] = -1;
    }

    unsetLevel() {
      this.styles.forEach(style => {
        this.unsetLevelStyle(style);
      });
    }

    setLevelStyle(style,level) {
      this.level[style] = level;
      if( this.globalLevel < level ) this.globalLevel = level;  
    }

    getLevelStyle(style) {
      return this.level[style];
    }

    getLevel() {
      return this.globalLevel;
    }

    setText(text) {
      this.currentValue = text;
      // this.cell.setValue(text);
    }

    getCurrentText() {
      return this.currentValue;
    }

    unsetText() {
      this.currentValue = this.originalValue;
    }

    setLink(url) {
      this.currentLink = url;
    }

    unsetLink() {
      this.currentLink = this.originalLink;
    }

    getCurrentLink() {
      return this.currentLink;
    }

    isGradient() {
      //TODO:
    }

    isShape() {
      return this.cell.isVertex();
    }

    isConnector() {
      return this.cell.isEdge();
    }

    updateCell() {
      if (this.matchedShape) {
        this.styles.forEach(style => {
          this.graph.setCellStyles(style, this.getCurrentColorStyle(style), [this.cell]);  
        });
      }
      if(this.matchedText) {
        this.cell.setValue(this.getCurrentText());
      }
      //TODO:LINK
    }

    restoreCell() {
      this.unsetState()
      this.styles.forEach(style => {
        this.graph.setCellStyles(style, this.getCurrentColorStyle(style), [this.cell]);  
      });
      this.cell.setValue(this.getCurrentText());
      this.cell.setAttribut("link",this.getCurrentLink());
    }
  }