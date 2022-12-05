/*globals define, WebGMEGlobal*/
// Code reference https://github.com/austinjhunt/petrinet-webgme-designstudio/blob/c26ab24f44979e198559fb977d3a37354f10c4ce/petri-net/src/visualizers/widgets/SimViz/SimVizWidget.js
 define(["jointjs", "css!./styles/SimSMWidget.css"], function (joint) {
  "use strict";
  var WIDGET_CLASS = "sim-s-m";
  function SimSMWidget(logger, container) {
    this._logger = logger.fork("Widget");
    this._el = container;
    this.nodes = {};
    this._initialize();
    this._logger.debug("ctor finished");
  }
  
  SimSMWidget.prototype._initialize = function () {
    joint.shapes.pn.Place = joint.shapes.basic.Generic.define(
      "pn.Place",
      {
        size: { width: 70, height: 70 },
        attrs: {
          ".root": {
            r: 25,
            fill: "#ffffff",
            stroke: "#000000",
            transform: "translate(25, 25)",
          },
          ".label": {
            "text-anchor": "middle",
            "ref-x": 0.5,
            "ref-y": -20,
            ref: ".root",
            fill: "#000000",
            "font-size": 16,
          },
          
          ".tokens > circle": {
            fill: "red",
            r: 2,
          },
          ".tokens.alot > text": {
            transform: "translate(25, 18)",
            "text-anchor": "middle",
            fill: "#000000",
          },
        },
      },
      {
        markup:
          '<g class="rotatable"><g class="scalable"><circle class="root"/><g class="tokens" /></g><text class="label"/></g>',
      }
    );

    joint.shapes.pn.PlaceView = joint.dia.ElementView.extend({
      presentationAttributes: joint.dia.ElementView.addPresentationAttributes({
        tokens: ["TOKENS"],
      }),
      initFlag: joint.dia.ElementView.prototype.initFlag.concat(["TOKENS"]),

      confirmUpdate: function (...args) {
        let flags = joint.dia.ElementView.prototype.confirmUpdate.call(
          this,
          ...args
        );
        if (this.hasFlag(flags, "TOKENS")) {
          this.renderTokens();
          this.update();
          flags = this.removeFlag(flags, "TOKENS");
        }
        return flags;
      },

      renderTokens: function () {
        const vTokens = this.vel.findOne(".tokens").empty();
        vTokens.addClass("alot");
        var tokens = this.model.get("tokens");
        vTokens.append(joint.V("text").text(`${tokens}`));
      },
    });

    joint.shapes.pn.TransitionView = joint.dia.ElementView.extend({
      presentationAttributes: joint.dia.ElementView.addPresentationAttributes({
        enabled: ["ENABLED"],
      }),
      initFlag: joint.dia.ElementView.prototype.initFlag.concat(["ENABLED"]),

      confirmUpdate: function (...args) {
        let flags = joint.dia.ElementView.prototype.confirmUpdate.call(
          this,
          ...args
        );
        if (this.hasFlag(flags, "ENABLED")) {
          this.renderStatus();
          this.update();
          flags = this.removeFlag(flags, "ENABLED");
        }
        return flags;
      },
      renderStatus: function () {
        let ENABLED_CLASS = "enabled-pulsate";
        let root = this.vel.findOne(".root");
        let label = this.vel.findOne(".label");
        let transitionName = this.model.get("name");
        var enabled = this.model.get("enabled");
        if (enabled) {
          label
            .text(`${transitionName}`)
            .addClass("enabled")
            .removeClass("disabled");
          root.addClass(ENABLED_CLASS);
        } else {
          label
            .text(`${transitionName}`)
            .removeClass("enabled")
            .addClass("disabled");
          root.removeClass(ENABLED_CLASS);
        }
      },
    });

    var width = this._el.width(),
      height = this._el.height(),
      self = this;

    // set widget class
    self._el.addClass(WIDGET_CLASS);
    const namespace = joint.shapes;
    self._jointPetriNet = new joint.dia.Graph({}, { cellNamespace: namespace });
    self._jointPaper = new joint.dia.Paper({
      el: self._el,
      width: width,
      height: height,
      gridSize: 10,
      model: self._jointPetriNet,
      defaultAnchor: { name: "perpendicular" },
      defaultConnectionPoint: { name: "boundary" },
      cellViewNamespace: namespace,
    });
  };

  SimSMWidget.prototype.onWidgetContainerResize = function (width, height) {
    this._logger.debug("Widget is resizing...");
  };

  SimSMWidget.prototype.initializePlaceVertices = function () {
    /* create a Circle vertex for each place using Joint JS; create an object
    mapping the joint vertex ids back to the place ids and set
    petriNet.id2place as that object.
    also set each place.joint (petriNet.places[pid1,pid2,...].joint)
    to respective joint vertex
    */
    let self = this;
    self._webgmePetriNet.id2place = {
      /* map on-screen ids to place ids */
    };
    Object.keys(self._webgmePetriNet.places).forEach((placeId) => {
      let place = self._webgmePetriNet.places[placeId];
      let vertex = new joint.shapes.pn.Place({
        position: place.position,
        size: { width: 70, height: 70 },
        attrs: {
          ".label": {
            text: self._webgmePetriNet.places[placeId].name,
            fill: "black",
          },
          ".root": {
            stroke: "black",
            strokeWidth: 1,
          },
          ".tokens > circle": {
            fill: "red",
          },
        },
        tokens: place.marks,
      });
      self._jointPetriNet.addCell([vertex]);
      self._webgmePetriNet.places[placeId].joint = vertex;
      self._webgmePetriNet.id2place[vertex.id] = placeId;
    });
  };

  SimSMWidget.prototype.initializeTransitionVertices = function () {
    /* create a white square vertex for each transition using Joint JS; create an object
    mapping the joint vertex ids back to the transition ids and set
    petriNet.id2transition as that object.
    also set each transition.joint (petriNet.transitions[tid1,tid2,...].joint)
    to respective joint vertex
    */
    let self = this;
    self._webgmePetriNet.id2transition = {
      /* map on-screen ids to place ids */
    };
    Object.keys(self._webgmePetriNet.transitions).forEach((transitionId) => {
      let transition = self._webgmePetriNet.transitions[transitionId];
      let vertex = new joint.shapes.pn.Transition({
        name: transition.name,
        position: transition.position,
        size: { width: 50, height: 50 },
        attrs: {
          ".label": {
            text: transition.name,
            "text-anchor": "middle",
            "ref-x": 0.5,
            "ref-y": -20,
            ref: ".root",
            fontSize: 18,
          },
          ".label.enabled": {
            fill: "green",
            stroke: "green",
          },
          ".label.disabled": {
            fill: "red",
            stroke: "red",
          },
          ".root": {
            fill: "red",
            stroke: "red",
          },
          ".root.enabled-pulsate": {
            stroke: "green",
            fill: "green"
          },
        },
      });
      vertex.addTo(self._jointPetriNet);
      self._webgmePetriNet.transitions[transitionId].joint = vertex;
      self._webgmePetriNet.id2transition[vertex.id] = transitionId;
    });
  };
 

  SimSMWidget.prototype.initializeArcs = function (arcType) {
    let self = this;
    let createJointLink = (a, b, name) => {
      return new joint.shapes.standard.Link({
        source: { id: a.id },
        target: { id: b.id },
        attrs: {
          line: {
            strokeWidth: 2,
          },
          wrapper: {
            cursor: "default",
          },
        },
        labels: [
          {
            position: {
              distance: 0.5,
              offset: 0,
              args: {
                keepGradient: true,
                ensureLegibility: true,
              },
            }
          },
        ],
      });
    };
    let arcsArray =
      arcType === "Arc_plac_transe"
        ? self._webgmePetriNet.arcPlaceToTrans
        : self._webgmePetriNet.arcTransToPlace;
    arcsArray.forEach((arc) => {
      let src =
        arcType === "Arc_plac_transe"
          ? self._webgmePetriNet.places[arc.src]
          : self._webgmePetriNet.transitions[arc.src];
      let dst =
        arcType === "Arc_plac_transe"
          ? self._webgmePetriNet.transitions[arc.dst]
          : self._webgmePetriNet.places[arc.dst];
      src.jointOutArcs = src.jointOutArcs || {};
      let link = createJointLink(src.joint, dst.joint, arc.name);
      link.addTo(self._jointPetriNet);
      src.jointOutArcs[arc.id] = link;
    });
  };

  SimSMWidget.prototype.initMachine = function (petriNetDescriptor) {
    const self = this;
    self._webgmePetriNet = petriNetDescriptor;
    self._jointPetriNet.clear();
    self.initializePlaceVertices();
    self.initializeTransitionVertices();
    ["Arc_plac_transe", "Arc_trans_place"].forEach((arcType) => {
      self.initializeArcs(arcType);
    });

    //now refresh the visualization
    self._jointPaper.updateViews();
    self._decorateMachine();
  };

  SimSMWidget.prototype.destroyMachine = function () {};

  let transitionIsFireable = (self, t, placesBefore = null) => {
    if (!placesBefore) {
      var inbound = self._jointPetriNet.getConnectedLinks(t, {
        inbound: true,
      });
      var placesBefore = inbound.map(function (link) {
        return link.getSourceElement();
      });
    }
    var isFirable = true;
    placesBefore.forEach(function (p) {
      if (p.get("tokens") === 0) {
        isFirable = false;
      }
    });
    return isFirable;
  };

  SimSMWidget.prototype.fireEvent = function (transition = null) {
    let self = this;

    /* reference: https://github.com/clientIO/joint/blob/master/demo/petri%20nets/src/pn.js#L14 */

    let fireTransition = (t, sec, self) => {
      var inbound = self._jointPetriNet.getConnectedLinks(t, { inbound: true });
      var outbound = self._jointPetriNet.getConnectedLinks(t, {
        outbound: true,
      });
      var placesBefore = inbound.map(function (link) {
        return link.getSourceElement();
      });
      var placesAfter = outbound.map(function (link) {
        return link.getTargetElement();
      });

      if (transitionIsFireable(self, t, placesBefore)) {
        let TOKEN_COLOR = "#ff0000";
        let TOKEN_RADIUS = 10;
        placesBefore.forEach(function (p) {
          // Let the execution finish before adjusting the value of tokens. So that we can loop over all transitions
          // and call fireTransition() on the original number of tokens.
          setTimeout(function () {
            p.set("tokens", p.get("tokens") - 1);
          }, 0);

          var links = inbound.filter(function (l) {
            return l.getSourceElement() === p;
          });

          links.forEach(function (l) {
            var token = joint.V("circle", {
              r: TOKEN_RADIUS,
              fill: TOKEN_COLOR,
            });
            l.findView(self._jointPaper).sendToken(token, sec * 1000);
          });
        });

        placesAfter.forEach(function (p) {
          var links = outbound.filter(function (l) {
            return l.getTargetElement() === p;
          });

          links.forEach(function (l) {
            var token = joint.V("circle", {
              r: TOKEN_RADIUS,
              fill: TOKEN_COLOR,
            });
            l.findView(self._jointPaper).sendToken(
              token,
              sec * 1000,
              function () {
                p.set("tokens", p.get("tokens") + 1);
              }
            );
          });
        });
      }
    };

    fireTransition(transition.joint, 1, self);
    setTimeout(() => {
      self._decorateMachine();
    }, 1250);
  };
  
  SimSMWidget.prototype.updateUI = function () {
    let self = this;
    let enabledTransitions = [];
    Object.keys(self._webgmePetriNet.transitions).forEach((id) => {
      let transition = self._webgmePetriNet.transitions[id];
      let isFireable = transitionIsFireable(self, transition.joint);
      transition.joint.set("enabled", isFireable);
      if (isFireable) {
        enabledTransitions.push(transition);
      }
    });
    self._webgmePetriNet.setFireableEvents(enabledTransitions);
    if (enabledTransitions.length === 0 && !self.hasNotifyDeadLock) {
      self._client.notifyUser({
        message: "Deadlock has been reached!",
        severity: "info",
      });
      self.hasNotifyDeadLock = true;
      setTimeout(() => {
        self.hasNotifyDeadLock = false;
      }, 5000);
    }
  };

  SimSMWidget.prototype.resetMachine = function () {
    this.initMachine(this._webgmePetriNet);
  };

  SimSMWidget.prototype._decorateMachine = function () {
    let self = this;
    self.updateUI();
    var isSM= self.checkIsStateMachine();
    if(isSM){
      self._client.notifyUser({
        message: "is State Machine",
        severity: "info",
      });
    }else{
      self._client.notifyUser({
        message: "is NOT State Machine",
        severity: "error",
      });
    }
    var isFC= self.checkisFreeChoice();
    if(isFC){
      self._client.notifyUser({
        message: "is Free Choice",
        severity: "info",
      });
    }else{
      self._client.notifyUser({
        message: "is NOT Free Choice",
        severity: "error",
      });
    }

    var isMG = self.checkisMarkingGraph();
    if(isMG){
      self._client.notifyUser({
        message: "is Marking Graph",
        severity: "info",
      });
    }else{
      self._client.notifyUser({
        message: "is NOT Marking Graph",
        severity: "error",
      });
    }
  };

  // Check current Net Classification
  SimSMWidget.prototype.checkIsStateMachine= function (){
    let self = this;   
    return Object.keys(self._webgmePetriNet.transitions).every((transId) => {
      return (
        Object.keys(self._webgmePetriNet.outMatrix).filter(
          (placeId) => self._webgmePetriNet.outMatrix[placeId][transId]
        ).length == 1 &&
        Object.keys(self._webgmePetriNet.inMatrix).filter(
          (placeId) => self._webgmePetriNet.inMatrix[placeId][transId]
        ).length == 1
      );
    });
  };

  SimSMWidget.prototype.checkisFreeChoice= function (){
    let map = {};
    let intersection = (arr1, arr2) => {
      return arr1.filter((val) => arr2.includes(val));
    };
    let self = this;
    Object.keys(self._webgmePetriNet.transitions).forEach((trans) => {
      map[trans.id] = Object.keys(self._webgmePetriNet.outMatrix).filter((placeId) => {
        return self._webgmePetriNet.outMatrix[placeId][trans.id];
      });
    });
    let isFreeChoice = Object.keys(map).every((t1, i) => {
      let t1_inplaces = map[t1];
      return Object.keys(map).every((t2, j) => {
        let t2_inplaces = map[t2];
        return intersection(t1_inplaces, t2_inplaces).length == 0 || t1 === t2;
      });
    });
    return isFreeChoice;
  };

  SimSMWidget.prototype.checkisMarkingGraph= function (){
    let self = this;
    return Object.keys(self._webgmePetriNet.places).every((_id) => {
      return (
        Object.keys(self._webgmePetriNet.outMatrix[_id]).filter(
          (transId) => self._webgmePetriNet.outMatrix[_id][transId]
        ).length == 1 &&
        Object.keys(self._webgmePetriNet.inMatrix[_id]).filter(
          (transId) => self._webgmePetriNet.inMatrix[_id][transId]
        ).length == 1
      );
    });
  };
  /* * * * * * * * Visualizer event handlers * * * * * * * */

  /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
  SimSMWidget.prototype.destroy = function () {};

  SimSMWidget.prototype.onActivate = function () {
    this._logger.debug("SimSMWidget has been activated");
  };

  SimSMWidget.prototype.onDeactivate = function () {
    this._logger.debug("SimSMWidget has been deactivated");
  };

  return SimSMWidget;
});
