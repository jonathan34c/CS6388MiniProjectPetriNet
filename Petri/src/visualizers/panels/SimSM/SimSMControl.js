define([
  "js/Constants",
  "js/Utils/GMEConcepts",
  "js/NodePropertyNames",
], function (CONSTANTS, GMEConcepts, nodePropertyNames) {
  "use strict";
  function SimSMControl(options) {
    this._logger = options.logger.fork("Control");
    this._client = options.client;
    // Initialize core collections and variables
    this._widget = options.widget;
    this._widget._client = options.client;

    this._currentNodeId = null;
    this._fireableEvents = null;
    this._networkRootLoaded = false;
    this._initWidgetEventHandlers();
    this._logger.debug("ctor finished");
    this.setFireableEvents = this.setFireableEvents.bind(this);
  }

  SimSMControl.prototype._initWidgetEventHandlers = function () {
    this._widget.onNodeClick = function (id) {
      // Change the current active object
      WebGMEGlobal.State.registerActiveObject(id);
    };
  };

  /* * * * * * * * Visualizer content update callbacks * * * * * * * */
  // One major concept here is with managing the territory. The territory
  // defines the parts of the project that the visualizer is interested in
  // (this allows the browser to then only load those relevant parts).
  SimSMControl.prototype.selectedObjectChanged = function (nodeId) {
    var self = this;

    // Remove current territory patterns
    if (self._currentNodeId) {
      self._client.removeUI(self._territoryId);
      self._networkRootLoaded = false; //addme
    }

    self._currentNodeId = nodeId;

    if (typeof self._currentNodeId === "string") {
      // Put new node's info into territory rules
      self._selfPatterns = {};
      self._selfPatterns[nodeId] = { children: 1 }; // Territory "rule"

      self._territoryId = self._client.addUI(self, function (events) {
        self._eventCallback(events);
      });

      // Update the territory
      self._client.updateTerritory(self._territoryId, self._selfPatterns);
    }
  };

  /* * * * * * * * Node Event Handling * * * * * * * */
  SimSMControl.prototype._eventCallback = function (events) {
    const self = this;
    events.forEach((event) => {
      if (event.eid && event.eid === self._currentNodeId) {
        if (event.etype == "load" || event.etype == "update") {
          self._networkRootLoaded = true;
        } else {
          return;
        }
      }
    });

    if (events.length && events[0].etype === "complete" && self._networkRootLoaded) {
      // complete means we got all requested data and we do not have to wait for additional load cycles
      self._initPetriNet();
    }
  };

  SimSMControl.prototype._stateActiveObjectChanged = function (
    model,
    activeObjectId
  ) {
    if (this._currentNodeId === activeObjectId) {
      // The same node selected as before - do not trigger
    } else {
      this.selectedObjectChanged(activeObjectId);
    }
  };

  /* * * * * * * * Machine manipulation functions * * * * * * * */
  SimSMControl.prototype._initPetriNet = function () {
    const self = this;
    const rawMETA = this._client.getAllMetaNodes();
    const META = {};
    
    rawMETA.forEach((node) => {
      META[node.getAttribute("name")] = node.getId(); //we just need the id...
    });
    const nodes = this._client.getNode(this._currentNodeId);
    const nodeIds = nodes.getChildrenIds();
    let placeIds = getTypeIds(this._client,nodeIds,"Place");
    let transIds = getTypeIds(this._client,nodeIds,"Transition");
    let arcPlaceTransIds = getTypeIds(this._client,nodeIds,"Arc_plac_transe");
    let arcTransPlaceIds = getTypeIds(this._client,nodeIds,"Arc_trans_place");
    let arcPlaceTrans = getArcsObject(self._client, arcPlaceTransIds);
    let arcTransPlace = getArcsObject(self._client, arcTransPlaceIds);
    let inMatrix = getMatrix(placeIds,transIds,arcTransPlace, true);
    let startPlaceId = getStartPlaceId(inMatrix);
    let outMatrix = getMatrix(placeIds,transIds,arcPlaceTrans, false);
    let petriNet = {
        isDeadlock: _petriNetInDeadlock,
        startPlace: startPlaceId,
        places:{},
        transitions:{},
        inMatrix : inMatrix,
        outMatrix: outMatrix,
        arcPlaceToTrans: arcPlaceTrans,
        arcTransToPlace: arcTransPlace
    };
    nodeIds.forEach((id)=>{
      const node = self._client.getNode(id);
      if (node.isTypeOf(META["Place"])) {
        petriNet.places[id] = {
          id: id,
          name: node.getAttribute("name"),
          marks: parseInt(node.getAttribute("Marks")),
          nextPlaceIds: getNextPlaces(
            id,
            arcPlaceTrans,
            arcTransPlace
          ),
          outTransitions: Object.keys(outMatrix[id]).filter(
            (transId) => outMatrix[id][transId]
          ),
          inTransitions: Object.keys(inMatrix[id]).filter(
            (transId) => inMatrix[id][transId]
          ),
          outArcs: arcPlaceTrans.filter((arc) => arc.src === id),
          position: node.getRegistry("position"),
        };
      }else if (node.isTypeOf(META["Transition"])) {
        petriNet.transitions[id] = {
          id: id,
          name: node.getAttribute("name"),
          outPlaces: Object.keys(inMatrix).filter(
            (placeId) => inMatrix[placeId][id]
          ),
          inPlaces: Object.keys(outMatrix).filter(
            (placeId) => outMatrix[placeId][id]
          ),
          outArcs: arcTransPlace.filter((arc) => arc.src === id),
          position: node.getRegistry("position"),
        };
      }
    });
    petriNet.setFireableEvents = this.setFireableEvents;
    self._widget.initMachine(petriNet);
    
  };

  SimSMControl.prototype.setFireableEvents = function (enabledTransitions) {
    this._fireableEvents = enabledTransitions;
    if (enabledTransitions && enabledTransitions.length >= 1) {
      // fill dropdown button with options. only including enabled transitions
      this.$btnEventSelector.clear();
      enabledTransitions.forEach((transition) => {
        this.$btnEventSelector.addButton({
          text: `Fire transition ${transition.name}`,
          title: `Fire transition ${transition.name}`,
          data: { event: transition },
          clickFn: (data) => {
            this._widget.fireEvent(data.event);
          },
        });
      });
    } else if (enabledTransitions && enabledTransitions.length === 0) {
      this._fireableEvents = null;
    }
    this._displayToolbarItems();
  };

  let getTypeIds =(client, nodeIds, typeName)=>{
    let ans =[];
    nodeIds.forEach((id, i)=>{
      let node = client.getNode(id);
      let type = node.getMetaTypeId();
      let name = client.getNode(type).getAttribute("name");
      if(name == typeName){
        ans.push(id);
      }
    });
    return ans;
  };

  let getArcsObject = (client, nodeIds)=>{
    let ans =[];
    nodeIds.forEach((id,i)=>{
      let node = client.getNode(id);
      ans.push({
        id : id,
        name : node.getAttribute("name"),
        src: node.getPointerId('src'),
        dst :node.getPointerId('dst')
      })
    });
    return ans;
  };

  let getMatrix=(placeIds, transIds,arcTransPlace, isIn)=>{
    let matrix ={};
    placeIds.forEach((pid, i)=>{
      matrix[pid] ={};
      transIds.forEach((tid,j)=>{
        if(isIn){
          matrix[pid][tid]=arcTransPlace.some((arc, k) => {
            return arc.src === tid && arc.dst === pid;
          });
        }else{
          matrix[pid][tid] = arcTransPlace.some((arc, index) => {
            return arc.src === pid && arc.dst === tid;
          });
        }
        
      });
    });
    return matrix;
  };

  let getStartPlaceId = (inputMatrix) => {
    // the first place is the place with no in flow and only out flow.
    for (const placeId in inputMatrix) {
      if (placeisDeadEnd(inputMatrix, placeId)) {
        return placeId;
      }
    }
    // if there is no place with no inflow, then use any of the places as starting point
    for (const placeId in inputMatrix) {
      return placeId;
    }
  };

  let placeisDeadEnd = (matrix, placeId) => {
    return Object.entries(matrix[placeId]).every((arr) => {
      return !arr[1];
    });
  };

  // Code reference https://github.com/austinjhunt/petrinet-webgme-designstudio/blob/main/petri-net/src/visualizers/panels/SimViz/SimVizControl.js
  let _petriNetInDeadlock = (petriNet) => {
    return Object.keys(petriNet.transitions).every((transId) => {
      let placetotrans = Object.keys(petriNet.outMatrix).filter(
        (placeId) => outputMatrix[placeId][transId]
      );
      placetotrans.every(
        (inPlaceId) => {
          parseInt(petriNet.places[inPlaceId].currentMarking) <= 0;
        }
      );
    });
  };

  let getNextPlaces = (
    placeId,
    arcsPlaceToTransition,
    arcsTransitionToPlace
  ) => {
    let nextPlaces = [];
    let outFlowArcs = arcsPlaceToTransition.filter((arc) => arc.src === placeId);
    outFlowArcs.forEach((arc_p2t) => {
      nextPlaces.push(
        ...arcsTransitionToPlace
          .filter((arc_t2p) => arc_t2p.src === arc_p2t.dst)
          .map((arc_t2p) => {
            // do not include already traversed in case of loops
            if (arc_t2p.src === arc_p2t.dst) {
              return arc_t2p.dst;
            }
          })
      );
    });
    return nextPlaces;
  };

  /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
  SimSMControl.prototype.destroy = function () {
    this._detachClientEventListeners();
    this._removeToolbarItems();
  };

  SimSMControl.prototype._attachClientEventListeners = function () {
    const self = this;
    self._detachClientEventListeners();
    WebGMEGlobal.State.on(
      "change:" + CONSTANTS.STATE_ACTIVE_OBJECT,
      self._stateActiveObjectChanged,
      self
    );
  };

  SimSMControl.prototype._detachClientEventListeners = function () {
    WebGMEGlobal.State.off(
      "change:" + CONSTANTS.STATE_ACTIVE_OBJECT,
      this._stateActiveObjectChanged
    );
  };

  SimSMControl.prototype.onActivate = function () {
    this._attachClientEventListeners();
    this._displayToolbarItems();

    if (typeof this._currentNodeId === "string") {
      WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {
        suppressVisualizerFromNode: true,
      });
    }
  };

  SimSMControl.prototype.onDeactivate = function () {
    this._detachClientEventListeners();
    this._hideToolbarItems();
  };



  /* * * * * * * * * * Updating the toolbar * * * * * * * * * */
  SimSMControl.prototype._displayToolbarItems = function () {
    if (this._toolbarInitialized === true) {
      this.$btnEventSelector.show();
      this.$btnReset.show();
    } else {
      this._initializeToolbar();
    }
  };

  SimSMControl.prototype._hideToolbarItems = function () {
    if (this._toolbarInitialized === true) {
      for (var i = this._toolbarItems.length; i--; ) {
        this._toolbarItems[i].hide();
      }
    }
  };

  SimSMControl.prototype._removeToolbarItems = function () {
    if (this._toolbarInitialized === true) {
      for (var i = this._toolbarItems.length; i--; ) {
        this._toolbarItems[i].destroy();
      }
    }
  };

  SimSMControl.prototype._initializeToolbar = function () {
    var toolBar = WebGMEGlobal.Toolbar;
    const self = this;
    self._toolbarItems = [];
    self._toolbarItems.push(toolBar.addSeparator());

    self.$btnReset = toolBar.addButton({
      title: "Reset ",
      text: "Reset ",
      icon: "glyphicon glyphicon-fast-backward",
      clickFn: function () {
        self._widget.resetMachine();
      },
    });
    self._toolbarItems.push(self.$btnReset);

    self.$btnEventSelector = toolBar.addDropDownButton({
      text: "Play a specific transition ",
      title: "Play a specific transition",
      icon: "glyphicon glyphicon-play",
    });
    self._toolbarItems.push(self.$btnEventSelector);
    self.$btnEventSelector.hide();
    self._toolbarInitialized = true;
  };
  return SimSMControl;
});
