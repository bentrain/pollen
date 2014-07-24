var Pollen = new (function(){
    
    
	var connections = [];
		
	
	this.exchange = (function(){
	
		var _watchInterval = 10 // mileseconds 
		
		var _connections = [];
		
		this.connectionType = {nodeToNode:0,nodeToAttribute:1,attributeToNode:2,attributeToAttribute:3};
		
		this.getConnections = function(){ return _connections;};
		
		this.connect = function(F,f,T,t){
			
			var tp = this.connectionType.nodeToNode;
			if(isDOM(F)) tp = this.connectionType.attributeToNode;
			if(isDOM(T)) tp = this.connectionType.nodeToAttribute;
			if(isDOM(F) && isDOM(T)) tp = this.connectionType.attributeToAttribute;			
			
			console.log(tp);
			
			
			switch(tp){
				case this.connectionType.nodeToNode:
					if(F.hasNode(f) && T.hasNode(t)){ _connections.push({type:tp,from:F,to:T,fromNode:f,toNode:t}); return;};
				case this.connectionType.nodeToAttribute:
					if(F.hasNode(f) && (T.hasAttribute(t) || T[t] != undefined)){ _connections.push({type:tp,from:F,to:T,fromNode:f,toNode:t}); return;};
				case this.connectionType.attributeToNode:
					if((F.hasAttribute(f) || F[f] != undefined ) && T.hasNode(t)){ _connections.push({type:tp,from:F,to:T,fromNode:f,toNode:t}); return;};
				case this.connectionType.attributeToAttribute:
					if((F.hasAttribute(f) || F[f] != undefined ) && (T.hasAttribute(t) || T[t] != undefined)){ _connections.push({type:tp,from:F,to:T,fromNode:f,toNode:t}); return;};
						

			}
			
			return false;
			
			
		};
		
		this.disconnect = function(F,f,T,t){
			
			var tp = this.connectionType.nodeToNode;
			if(isDOM(F)) tp = this.connectionType.attributeToNode;
			if(isDOM(T)) tp = this.connectionType.nodeToAttribute;
			if(isDOM(F) && isDOM(T)) tp = this.connectionType.attributeToAttribute;	
			
			for(var conn in _connections){
				switch(tp){
					case this.connectionType.nodeToNode:
						if(_connection[conn].type == tp && _connections[conn].from.pollenID == F.pollenID && _connections[conn].to.pollenID == T.pollenID && _connections[conn].fromNode == f && _connections[conn].toNode == t){ _connections.splice(conn,1); return;};
					case this.connectionType.attributeToNode:
						if(_connection[conn].type == tp && _connections[conn].from.getAttribute("pollenID") == F.getAttribute("pollenID") && _connections[conn].to.pollenID == T.pollenID && _connections[conn].fromNode == f && _connections[conn].toNode == t){ _connections.splice(conn,1); return;};
					case this.connectionType.nodeToAttribute:
						if(_connection[conn].type == tp && _connections[conn].from.pollenID == F.pollenID && _connections[conn].to.getAttribute("pollenID") == T.getAttribute("pollenID") && _connections[conn].fromNode == f && _connections[conn].toNode == t){ _connections.splice(conn,1); return;};
					case this.connectionType.AttributeToAttribute:
						if(_connection[conn].type == tp && _connections[conn].from.getAttribute("pollenID") == F.getAttribute("pollenID") && _connections[conn].to.getAttribute("pollenID") == T.getAttribute("pollenID") && _connections[conn].fromNode == f && _connections[conn].toNode == t){ _connections.splice(conn,1); return;};
					
				
				
				}
				
				return false;
			
			}			
		};	

		this.disconnectObject = function(o){
			
			// needs reworking for DOM addition
			/*
			for(var conn in _connections){
				if(_connections[conn].from.pollenID == o.pollenID || _connections[conn].to.pollenID == o.pollenID) _connections.splice(conn,1);
			}
			
			*/
		}
		
		
		// report a node change
		this.report = function(i,p,v,msg){
		
			msg = msg || "";
			
			console.log("Report:",i,p,v,msg);
			
			var c, cn;	
				
			for(var cn in _connections){
				
				c = _connections[cn];
						
				var tp = this.connectionType.nodeToNode;
				if(isDOM(c.from)) tp = this.connectionType.attributeToNode;
				if(isDOM(c.to)) tp = this.connectionType.nodeToAttribute;
				if(isDOM(c.from) && isDOM(c.to)) tp = this.connectionType.attributeToAttribute;	
				
				switch(tp){
				
					case this.connectionType.nodeToNode:
						if(c.from.pollenID == i && c.fromNode == p){
							if(c.to.getNode(c.toNode) !== v){
								c.to.setNode(c.toNode,v);
							}
						}
						break;
					case this.connectionType.nodeToAttribute:
						if(c.from.pollenID == i && c.fromNode == p){
							if(c.to.getAttribute(c.toNode) !== v || c.to[c.toNode] !== v){
								c.to.setAttribute(c.toNode,v);
								if(c.to[c.toNode] != undefined) c.to[c.toNode] = v;
							}
						}
						break;
					case this.connectionType.attributeToNode:
						if(c.from.getAttribute("pollenID") == i && c.fromNode == p){
							if(c.to.getNode(c.toNode) !== v){
								c.to.setNode(c.toNode,v);
							}
						}
						break;
					case this.connectionType.attributeToAttribute:
						if(c.from.getAttribute("pollenID") == i && c.fromNode == p){
							if(c.to.getAttribute(c.toNode) !== v || c.to[c.toNode] !== v){
								c.to.setAttribute(c.toNode,v);
								if(c.to[c.toNode] != undefined) c.to[c.toNode] = v;
							}
						}
						break;
					
				
				}
				
			}
			
		}
		
		// TO DO implement a nicer attribute watch system for DOM
		
		function watchConnections(){
			var c, cn, v;
			for(cn in _connections){
				c = _connections[cn];
				if(c.type == this.connectionType.attributeToNode || c.type == this.connectionType.attributeToAttribute){
					v = c.from.getAttribute(c.fromNode);
					if(c.from[c.fromNode] != undefined) v = c.from[c.fromNode];
					if(c.lastValue != v){
						c.lastValue = v;
						this.report(c.from.getAttribute('pollenID'),c.fromNode,v);
					}
				}
			}
		}
		
		setInterval(watchConnections,_watchInterval);
	
		return this;
		
	})();
	
	this.behaviour = (function(){
		
		var _behaviours = {
			
			interactive:function(){
				
				this.nodes = {
				
					onInteraction:{
					},
					
					onInteractionBegin:{
					},
					
					onInteractionEnd:{
					
					}
				
				}
			
			}
			
		}
		
		
		this.addBehaviour = function(){};
		
		this.removeBehaviour = function(){};
		
		this.getBehaviours = function(){ return _behaviours;};
	
	
	})();
	
	
	this.factory = (function(){
		
		var _logic = {
		
			counter:function(){
			
				var _this = this;
				
				var _val = 0;
				var _stp = 1;
				var _trg = false;
								
				
				this.label = "Counter";
				this.desc = "Used to keep incremental count of a value"; 
				this.nodes = {
				
					value:{
						type:"number",
						label:"Value",
						desc:"The current value of the counter",
						get:function(){ return _val; },
						set:function(v){
							_val = v;
							Pollen.exchange.report(_this.pollenID,"add",v,"counter.value");
						}
					},
					step:{
						type:"number",
						label:"Step",
						desc:"The amount to increment the counter each time it is triggered",
						get:function(){ return _stp; },
						set:function(v){ _stp = v; }
					},
					add:{
						type:"boolean",
						label:"Add",
						desc:"Adds the current step amount to the current counter value",
						get:function(){ return _trg; },
						set:function(v){
							_val += _stp;
							Pollen.exchange.report(_this.pollenID,"value",_val,"counter.add");
						}
					
					},
					subtract:{
						type:"boolean",
						label:"Subtract",
						desc:"Subtracts the current step amount from the current counter value",
						get:function(){ return _trg; },
						set:function(v){
							_val -= _stp;
							Pollen.exchange.report(_this.pollenID,"value",_val,"counter.subtract");
						}
					
					},
					clear:{
						type:"boolean",
						label:"Clear",
						desc:"Clears the value of the counter",
						get:function(){ return false; },
						set:function(){
							_val = 0;
							Pollen.exchange.report(_this.pollenID,"value",_val,"counter.clear");
						}
					
					}
				
				}
			
			},
			
			calculator:function(){
			
				var _this = this;
				
				var _val = 0;
								
				this.label = "Calculator";
				this.desc = "Used to calculator numbers"; 
				this.nodes = {
				
					value:{
						type:"number",
						label:"Value",
						desc:"The current value of the calculator",
						get:function(){ return _val; },
						set:function(v){
							_val = Number(v);
							Pollen.exchange.report(_this.pollenID,"add",v,"calculator.value");
						}
					},
					add:{
						type:"number",
						label:"Add",
						desc:"Add a number to the current value",
						get:function(){ return _val; },
						set:function(v){
							_val += Number(v);
							Pollen.exchange.report(_this.pollenID,"value",_val,"calculator.add");
						}
					},
					subtract:{
						type:"number",
						label:"Subtract",
						desc:"Subtract a number from the current value",
						get:function(){ return _val; },
						set:function(v){
							_val -= Number(v);
							Pollen.exchange.report(_this.pollenID,"value",_val,"calculator.subtract");
						}
					},
					multiply:{
						type:"number",
						label:"Multiply",
						desc:"Multiply the value by this number",
						get:function(){ return _val; },
						set:function(v){
							_val *= Number(v);
							Pollen.exchange.report(_this.pollenID,"value",_val,"calculator.multiply");
						}
					},
					divide:{
						type:"number",
						label:"Divide",
						desc:"Divide the value by this number",
						get:function(){ return _val; },
						set:function(v){
							_val /= Number(v);
							Pollen.exchange.report(_this.pollenID,"value",_val,"calculator.divide");
						}
					},
					clear:{
						type:"boolean",
						label:"Clear",
						desc:"Clears the value of the calculator",
						get:function(){ return false; },
						set:function(){
							_val = 0;
							Pollen.exchange.report(_this.pollenID,"value",_val,"calculator.clear");
						}
					
					}
					
				}
			
			},
			
			ticker:function(){
			
				var _this = this;
				
				var _int = 1000;
				var _running = false;
				var _interval = setInterval(function(){ if(_running) _this.nodes.tick.set(); },_int);
				
				this.label = "Ticker";
				this.desc = "Allows actions to be fired at regular intervals"
				this.nodes = {
					
					tick:{
						type:"boolean",
						label:"Tick",
						desc:"Triggers each tick of the ticker",
						get:function(){ return false; },
						set:function(){
							Pollen.exchange.report(_this.pollenID,true,"ticker.tick");
						}
					},
					
					start:{
						type:"boolean",
						label:"Start",
						desc:"Start the ticker",
						get:function(){ return false; },
						set:function(){
							_running = true;
							Pollen.exchange.report(_this.pollenID,true,"ticker.start");
						}
					},
					
					stop:{
						type:"boolean",
						label:"Stop",
						desc:"Stop the ticker",
						get:function(){ return false; },
						set:function(){
							_running = false;
							Pollen.exchange.report(_this.pollenID,true,"ticker.stop");
						}
					},
					
					interval:{
						type:"boolean",
						label:"interval",
						desc:"Stop the ticker",
						get:function(){ return false; },
						set:function(){
							_running = false;
							Pollen.exchange.report(_this.pollenID,true,"ticker.interval");
						}
					}
					
					
				
				
				}
			
			},
		
			store:function(){
				
				var _this = this;
				
				var _val = 0;
				
				this.label = "Store";
				this.desc = "Store a value for later use";
				this.nodes = {
					value:{
						type:"mixed",
						label:"Value",
						desc:"Value to store",
						get:function(){ return _val; },
						set:function(v){
							_val = v;
							Pollen.exchange.report(_this.pollenID,"value",v,"store.value");
						}
					}
				}
			},
			
			gate:function(){
							
				var _this = this;
				
				var _open = true;
				var _data = "";
				
				this.label = "Gate";
				this.desc = "A simple data gate which is set to either open or closed"
				this.nodes = {
					open:{
						type:"boolean",
						label:"Open",
						desc:"Open the gate to let data through",
						get:function(){ return _open; },
						set:function(){
							_open = true;
							Pollen.exchange.report(_this.pollenID,"data",_data,"gate.open");
						}
					},
					close:{
						type:"boolean",
						label:"Close",
						desc:"Close the gate to stop data getting through",
						get:function(){ return _open; },
						set:function(){
							_open = false;
						}
					},
					data:{
						type:"boolean",
						label:"State",
						desc:"Get/Set the current state of the gate, open (true) or closed (false)",
						get:function(){ return _data; },
						set:function(v){
							_data = v;
							if(_open) Pollen.exchange.report(_this.pollenID,"data",_data,"gate.data");
						}
					}
				}
			},
			
			andGate:function(){
				
				
				var _this = this;
				
				var _condA = false;
				var _condB = false;
				var _data = "";
								
				this.label = "Gate (AND)";
				this.desc = "A data gate which will only be open when both conditions are true";
				this.nodes = {
					conditionA:{
						type:"mixed",
						label:"Condition A",
						desc:"The first condition which must be met to open gate",
						get:function(){ return _condA; },
						set:function(v){
							_condA = v;
							if(_condA && _condB) Pollen.exchange.report(_this.pollenID,"data",_data,"andGate.conditionA");
						}
					
					},
					conditionB:{
						type:"mixed",
						label:"Condition B",
						desc:"The second condition which must be met to open gate",
						get:function(){ return _condB; },
						set:function(v){
							_condB = v;
							if(_condA && _condB) Pollen.exchange.report(_this.pollenID,"data",_data,"andGate.conditionB");
						}
					
					},
					data:{
						type:"mixed",
						label:"data",
						desc:"The data to transfer if gate is open",
						get:function(){ return _data; },
						set:function(v){
							_data = v;
							if(_condA && _condB) Pollen.exchange.report(_this.pollenID,"data",_data,"andGate.data");
						}
					
					}
				
				
				}
			
			
			},
			
			orGate:function(){
							
				var _this = this;
				
				var _condA = false;
				var _condB = false;
				var _data = "";
								
				this.labe = "Gate (OR)";
				this.desc = "A data gate which will be open when one or both conditions are true";
				this.nodes = {
					conditionA:{
						type:"boolean",
						label:"Condition A",
						desc:"The first condition which must be met to open gate",
						get:function(){ return _condA; },
						set:function(v){
							_condA = v;
							if(_condA || _condB) Pollen.exchange.report(_this.pollenID,"state",data,"orGate.conditionA");
						}
					
					},
					conditionB:{
						type:"boolean",
						label:"Condition B",
						desc:"The second condition which must be met to open gate",
						get:function(){ return _condB; },
						set:function(v){
							_condB = v;
							if(_condA || _condB) Pollen.exchange.report(_this.pollenID,"state",data,"orGate.conditionB");
						}
					
					},
					data:{
						type:"boolean",
						label:"State",
						desc:"The first condition which must be met to open gate",
						get:function(){ return _data; },
						set:function(v){
							_data = v;
							if(_condA || _condB) Pollen.exchange.report(_this.pollenID,"state",data,"orGate.data");
						}
					
					}
				
				
				}
			
			
			},
			
			eorGate:function(){
							
				var _this = this;
				
				var _condA = false;
				var _condB = false;
				var _data = "";
								
				this.labe = "Gate (EOR)";
				this.desc = "A data gate which will be open when one but not both conditions are true";
				this.nodes = {
					conditionA:{
						type:"boolean",
						label:"Condition A",
						desc:"The first condition which must be met to open gate",
						get:function(){ return _condA; },
						set:function(v){
							_condA = v;
							if((_condA && !_condB) || (!_condA && _condB)) Pollen.exchange.report(_this.pollenID,"state",data,"eorGate.conditionA");
						}
					
					},
					conditionB:{
						type:"boolean",
						label:"Condition B",
						desc:"The second condition which must be met to open gate",
						get:function(){ return _condB; },
						set:function(v){
							_condB = v;
							if((_condA && !_condB) || (!_condA && _condB)) Pollen.exchange.report(_this.pollenID,"state",data,"eorGate.conditionB");
						}
					
					},
					data:{
						type:"boolean",
						label:"State",
						desc:"The first condition which must be met to open gate",
						get:function(){ return _data; },
						set:function(v){
							_data = v;
							if((_condA && !_condB) || (!_condA && _condB)) Pollen.exchange.report(_this.pollenID,"state",data,"eorGate.data");
						}
					
					}
				
				
				}
			
			
			},
			
			inputSwitch:function(){
			
				var _this = this;
				
				var _cinp = 0;
				var _inputs = ["","","","","","","",""];
				
				this.label = "Input Switch";
				this.desc = "Switch between multiple data inputs";
				this.nodes = {
					input0:{
						label:"Input 0",
						type:"mixed",
						desc:"Input connector",
						get:function(){ return _inputs[0]; },
						set:function(v){
							_inputs[0] = v;
							if(_cinp == 0) Pollen.exchange.report(_this.pollenID,"data",v,"inputSwitch.input0");
						}
					},
					input1:{
						label:"Input 0",
						type:"mixed",
						desc:"Input connector",
						get:function(){ return _inpputs[1]; },
						set:function(v){
							_inputs[1] = v;
							if(_cinp == 1) Pollen.exchange.report(_this.pollenID,"data",v,"inputSwitch.input1");
						}
					},
					input2:{
						label:"Input 2",
						type:"mixed",
						desc:"Input connector",
						get:function(){ return _inputs[2]; },
						set:function(v){
							_inputs[2] = v;
							if(_cinp == 2) Pollen.exchange.report(_this.pollenID,"data",v,"inputSwitch.input2");
						}
					},
					input3:{
						label:"Input 3",
						type:"mixed",
						desc:"Input connector",
						get:function(){ return _inputs[3]; },
						set:function(v){
							_inputs[3] = v;
							if(_cinp == 3) Pollen.exchange.report(_this.pollenID,"data",v,"inputSwitch.input3");
						}
					},
					input4:{
						label:"Input 4",
						type:"mixed",
						desc:"Input connector",
						get:function(){ return _inputs[4]; },
						set:function(v){
							_inputs[4] = v;
							if(_cinp == 4) Pollen.exchange.report(_this.pollenID,"data",v,"inputSwitch.input4");
						}
					},
					input5:{
						label:"Input 5",
						type:"mixed",
						desc:"Input connector",
						get:function(){ return _inputs[5]; },
						set:function(v){
							_inputs[5] = v;
							if(_cinp == 5) Pollen.exchange.report(_this.pollenID,"data",v,"inputSwitch.input5");
						}
					},
					input6:{
						label:"Input 6",
						type:"mixed",
						desc:"Input connector",
						get:function(){ return _inputs[6]; },
						set:function(v){
							_inputs[6] = v;
							if(_cinp == 6) Pollen.exchange.report(_this.pollenID,"data",v,"inputSwitch.input6");
						}
					},
					input7:{
						type:"mixed",
						label:"Input 7",
						desc:"Input connector",
						get:function(){ return _inputs[7]; },
						set:function(v){
							_inputs[7] = v;
							if(_cinp == 7) Pollen.exchange.report(_this.pollenID,"data",v,"inputSwitch.input7");
						}
					},
					useInput:{
						label:"Use Input",
						type:"number",
						desc:"Set the number of the data input to use",
						get:function(){ return _cinp; },
						set:function(v){
							_cinp = v;
							Pollen.exchange.report(_this.pollenID,"data",eval("_inp"+v),"inputSwitch.useInput");
						}
					},
					data:{
						
						label:"Data",
						type:"mixed",
						desc:"The data to transfer",
						get:function(){ return _data;},
						set:function(v){
							_data = v;
							Pollen.exchange.report(_this.pollenID,"data",_data,"inputSwitch.data");
						}
					
					}
					
				
				}
			
			},
			
			outputSwitch:function(){
			
				var _this = this;
				
				var _cout = 0;
				var _outputs = ["","","","","","","",""];
				var _data = "";
				
				this.label = "Output Switch";
				this.desc = "Switch between multiple data outputs";
				this.nodes = {
					output0:{
						label:"Output 0",
						type:"mixed",
						desc:"Output connector",
						get:function(){ return _outputs[0]; },
						set:function(v){
							_outputs[0] = v;
							if(_cout == 0) Pollen.exchange.report(_this.pollenID,"output0",v,"outputSwitch.output0");
						}
					},
					output1:{
						label:"Output 1",
						type:"mixed",
						desc:"Output connector",
						get:function(){ return _outputs[1]; },
						set:function(v){
							_outputs[1] = v;
							if(_cout == 1) Pollen.exchange.report(_this.pollenID,"output1",v,"outputSwitch.output1");
						}
					},
					output2:{
						label:"Output 2",
						type:"mixed",
						desc:"Output connector",
						get:function(){ return _outputs[2]; },
						set:function(v){
							_outputs[2] = v;
							if(_cout == 2) Pollen.exchange.report(_this.pollenID,"output2",v,"outputSwitch.output2");
						}
					},
					output3:{
						label:"Output 3",
						type:"mixed",
						desc:"Output connector",
						get:function(){ return _outputs[3]; },
						set:function(v){
							_outputs[3] = v;
							if(_cout == 3) Pollen.exchange.report(_this.pollenID,"output3",v,"outputSwitch.output3");
						}
					},
					output4:{
						label:"Output 4",
						type:"mixed",
						desc:"Output connector",
						get:function(){ return _outputs[4]; },
						set:function(v){
							_outputs[4] = v;
							if(_cout == 4) Pollen.exchange.report(_this.pollenID,"output4",v,"outputSwitch.output4");
						}
					},
					output5:{
						label:"Output 5",
						type:"mixed",
						desc:"Output connector",
						get:function(){ return _outputs[5]; },
						set:function(v){
							_outputs[5] = v;
							if(_cout == 5) Pollen.exchange.report(_this.pollenID,"output5",v,"outputSwitch.output5");
						}
					},
					output6:{
						label:"Output 6",
						type:"mixed",
						desc:"Output connector",
						get:function(){ return _outputs[6]; },
						set:function(v){
							_outputs[6] = v;
							if(_cout == 6) Pollen.exchange.report(_this.pollenID,"output6",v,"outputSwitch.output6");
						}
					},
					output7:{
						label:"Output 7",
						type:"mixed",
						desc:"Output connector",
						get:function(){ return _outputs[7]; },
						set:function(v){
							_outputs[7] = v;
							if(_cout == 7) Pollen.exchange.report(_this.pollenID,"output7",v,"outputSwitch.output7");
						}
					},
					useOutput:{
						label:"Use Output",
						type:"number",
						desc:"Set the number of the data output to use",
						get:function(){ return _cout; },
						set:function(v){
							_cout = v;
							Pollen.exchange.report(_this.pollenID,"output"+v,_data,"outputSwitch.useOutput");
						}
					},
					data:{
						label:"Data",
						type:"mixed",
						desc:"The data to delegate",
						get:function(){ return _data; },
						set:function(v){
							_data = v;
							_outputs[_cout] = _data;
							Pollen.exchange.report(_this.pollenID,"output"+_cout,_data,"outputSwitch.data");
						
						}
					}
					
				
				}
			
			},
		
			randomNumberGenerator:function(){
				
				var _this = this;
				
				var _round = true;
				var _rangeStart = 0;
				var _rangeEnd = 1;
				var _data = 0;
				
				this.label = "Random Number Generator";
				this.desc = "Generates a random number between a specified range";
				this.nodes = {
						
					round:{
						type:"boolean",
						label:"Round",
						desc:"Round the generated number to nearest whole number",
						get:function(){ return _round; },
						set:function(v){ _round = v; }
					},
					
					rangeStart:{
						type:"number",
						label:"Range Start",
						desc:"The number the random range should start at",
						get:function(){ return _rangeStart; },
						set:function(v){
							_rangeStart = v;
						}
						
					},
					rangeEnd:{
						type:"number",
						label:"Range End",
						desc:"The number the random range should end at",
						get:function(){ return _rangeEnd; },
						set:function(v){
							_rangeEnd = v;
						}
						
					},
					data:{
						type:"number",
						label:"Data",
						desc:"The resulting randomly generated number",
						get:function(){ return _data; },
						set:function(v){
							_data = v;
							Pollen.exchange.report(_this.pollenID,"data",_data,"randomNumberGenerator.data");
						}
					},
					trigger:{
						type:"boolean",
						label:"Trigger",
						desc:"Trigger the generation of a random number",
						get:function(){ return false; },
						set:function(v){ 
							var r = Math.random() * (_rangeEnd - _rangeStart)
							if(_round) r = Math.round(r);
							_data = _rangeStart + r;
							Pollen.exchange.report(_this.pollenID,"data",_data,"randomNumberGenerator.trigger");
						}
					}
				
				}
			
			},
			
			tweener:function(){
			
				
				var _this = this;
				
				var _methods = ["linear","easeInQuad","easeOutQuad"];
				var _startValue = 0;
				var _endValue = 0;
				var _output = 0;
				var _dur = 1000;
				var _stt = 0;
				var _method = 0;
				var _timer;
				var _int = 10;
				var _playing = false;
				
				function playTween(){
										
					if(!_timer){
						_playing = true;
						_timer = setInterval(function(){
							if(_playing){
								_stt += _int;
								if(_stt <= _dur){
									_output = calculateValue(_methods[_method],_stt);	
									Pollen.exchange.report(_this.pollenID,"output",_output,"tweener.output (func)");
								}else{
									_stt = 0;
									_playing = false;
									clearInterval(_int);
									Pollen.exchange.report(_this.pollenID,"finished",true,"tweener.finished");
								}
							}							
						},_int);
					}else{
						_playing = true;
					}
				}
				
				function stopTween(){
					_playing = false;
				}
				
				function calculateValue(m,t){
				
					var t = t; // time
					var b = _startValue; // beginning
					var c = _endValue - _startValue; // change in value
					var d = _dur; // duration
				
					switch(m){
					
						case "linear": return d/t * c + b;
						case "easeInQuad": return c*(t/=d)*t + b;
						case "easeOutQuad": return -c *(t/=d)*(t-2) + b;
						case "easeInOutQuad": return ((t/=d/2) < 1) ? c/2*t*t + b : -c/2 * ((--t)*(t-2) - 1) + b;
						case "easeInCubic":	return c*(t/=d)*t*t + b;
						case "easeOutCubic": return c*((t=t/d-1)*t*t + 1) + b;
						case "easeInOutCubic": return ((t/=d/2) < 1) ? c/2*t*t*t + b : c/2*((t-=2)*t*t + 2) + b;
						case "easeInQuart": return c*(t/=d)*t*t*t + b;
						case "easeOutQuart": return -c * ((t=t/d-1)*t*t*t - 1) + b;
						case "easeInOutQuart": return ((t/=d/2) < 1) ? c/2*t*t*t*t + b : -c/2 * ((t-=2)*t*t*t - 2) + b;
						case "easeInQuint": return c*(t/=d)*t*t*t*t + b;
						case "easeOutQuint": return c*((t=t/d-1)*t*t*t*t + 1) + b;
						case "easeInOutQuint": return ((t/=d/2) < 1) ? c/2*t*t*t*t*t + b : c/2*((t-=2)*t*t*t*t + 2) + b;
						case "easeInSine": return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
						case "easeOutSine": return c * Math.sin(t/d * (Math.PI/2)) + b;
						case "easeInOutSine": return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
						case "easeInExpo": return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
						case "easeOutExpo": return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
						case "easeInOutExpo": 
							if (t==0) return b;
							if (t==d) return b+c;
							if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
							return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
						case "easeInCirc": return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
						case "easeOutCirc": return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
						case "easeInOutCirc": return ((t/=d/2) < 1) ? -c/2 * (Math.sqrt(1 - t*t) - 1) + b : c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
						case "easeInElastic": 
							var s=1.70158;var p=0;var a=c;
							if (t==0) return b;
							if ((t/=d)==1) return b+c;
							if (!p) p=d*.3;
							if (a < Math.abs(c)) { a=c; var s=p/4; }
							else var s = p/(2*Math.PI) * Math.asin (c/a);
							return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
						case "easeOutElastic":
							var s=1.70158;var p=0;var a=c;
							if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
							if (a < Math.abs(c)) { a=c; var s=p/4; }
							else var s = p/(2*Math.PI) * Math.asin (c/a);
							return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
						case "easeInOutElastic":
							var s=1.70158;var p=0;var a=c;
							if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
							if (a < Math.abs(c)) { a=c; var s=p/4; }
							else var s = p/(2*Math.PI) * Math.asin (c/a);
							if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
							return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
						case "easeInBack":
							if (s == undefined) s = 1.70158;
							return c*(t/=d)*t*((s+1)*t - s) + b;
						case "easeOutBack":
							if (s == undefined) s = 1.70158;
							return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
						case "easeInOutBack":
							if (s == undefined) s = 1.70158; 
							if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
							return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
						case "easeInBounce":
							return c - calculateValue("easeOutBounce",d-t) + b;
						
						case "easeOutBounce":
							if ((t/=d) < (1/2.75)) {
								return c*(7.5625*t*t) + b;
							} else if (t < (2/2.75)) {
								return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
							} else if (t < (2.5/2.75)) {
								return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
							} else {
								return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
							}
						case "easeInOutBounce":
							if (t < d/2) return calculateValue("easeInBounce",t*2) * .5 + b;
							return calculateValue("easeOutBounce", t*2-d) * .5 + c*.5 + b;
				
						
					}
				
				}
				
				
				this.label = "Tweener";
				this.desc = "Tween a property between current value to a new value over a period of time";
				this.nodes = {
					
					duration:{
						type:"number",
						label:"Duration",
						desc:"The duration over which to perform the tween",
						get:function(){ return _duration; },
						set:function(v){
							_dur = v;
							Pollen.exchange.report(_this.pollenID,"duration",_dur,"tweener.duration");
						}
					},
					
					startValue:{
						type:"number",
						label:"startValue",
						desc:"The start value for the tween",
						get:function(){ return _startValue; },
						set:function(v){
							_startValue = v;
							Pollen.exchange.report(_this.pollenID,"startValue",_startValue,"tweener.startValue");
						}
					},
					
					endValue:{
						type:"number",
						label:"endValue",
						desc:"The end value for the tween",
						get:function(){ return _endValue; },
						set:function(v){
							_endValue = v;
							Pollen.exchange.report(_this.pollenID,"endValue",_endValue,"tweener.endValue");
						}
					},
					
					output:{
						type:"number",
						label:"output",
						desc:"The current tween value",
						get:function(){ return _output; },
						set:function(v){
							_output = v;
							Pollen.exchange.report(_this.pollenID,"output",_output,"tweener.output");
						}
					},
					
					play:{
						type:"boolean",
						label:"Play",
						desc:"Play the tween",
						get:function(){ return false; },
						set:function(){
							playTween();
						}
					
					},
					
					stop:{
						type:"boolean",
						label:"Stop",
						desc:"Stop the tween",
						get:function(){ return false;},
						set:function(){
							stopTween();
						}
					},
					
					finished:{
						type:"boolean",
						label:"Finished",
						desc:"Fired when the tween is finished",
						get:function(){ return false;},
						set:function(){
							Pollen.exchange.report(_this.pollenID,"finished",true,"tweener.finished");
						}
						
						
					}
				
				}
			
			}
		
		}
		
		var _ui = {
		
			documentObject:function(obj){
				
				var _this = this;
				
				var _x = 0;
				var _y = 0;
				var _height = 0;
				var _width = 0;
				var _dom = obj;
				
				this.label = "Document Object";
				this.desc = "A raw DOM element";
				this.nodes = {
				
					self:{
						type:"object",
						label:"Self",
						desc:"Send this object along as a reference",
						get:function(){ return this; },
						set:function(){
							Pollen.exchange.report(_this.pollenID,"self",this,"documentObject.self");
						}
					},
										
					x:{
						label:"Position X",
						type:"number",
						get:function(){return _x;},
						set:function(v){
							_x = v;
							_dom.style.left = v + "px";
							Pollen.exchange.report(_this.pollenID,"x",_x,"documentObject.x");
						}
					},
					
					y:{
						label:"Position Y",
						type:"number",
						get:function(){ return _y;},
						set:function(v){
							_y = v;
							_dom.style.top = v + "px";
							Pollen.exchange.report(_this.pollenID,"y",_y,"documentObject.x");
						}
					},
					
					width:{
						label:"Width",
						type:"number",
						get:function(){return _width;},
						set:function(v){
							_width = v;
							_dom.style.width = v = "px";
							Pollen.exchange.report(_this.pollenID,"width",_width,"documentObject.width");
						}
					},
					
					height:{
						label:"Height",
						type:"number",
						get:function(){return _height;},
						set:function(v){
							_height = v;
							_dom.style.height = v + "px";
							Pollen.exchange.report(_this.pollenID,"height",_height,"documentObject.height");
						}
					}
				}
				
			}
		
		}
		
		
		
		this.make = function(v,args){
			
			var func = eval("_" + v);
			
			var obj = new func(args);
			
			Pollen.pollinate(obj);
			
			return obj;
		}
			
		return this;
	
	})();
	
	function UID(){
        return new Date().getTime() + "_" + Math.floor(Math.random()*999) + "_" + Math.floor(Math.random()*999);
    }
    
    
	function addDefaultNodes(o){
	
		var nodes = {
		
			
		};
		
		
		if(!o.nodes) o.nodes = {};
		
		for(var node in nodes){
			
			if(!o.nodes[node]) o.nodes[node] = nodes[node];
		}
		
		o.hasDefaultNodes = true;
		
	}
	
	function isDOM(o){
		return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string";
	}
	
	this.pollinate = function(){
        
		var o;
		
		for(var obj in arguments){
		
			o = arguments[obj];
		
			var _isDOM = isDOM(o);

			if((!_isDOM && !o.isPollinated) || (_isDOM && !o.className.indexOf('pollinated') > -1)){
			
				var _id = UID();
			
				if(_isDOM){
					console.log(o)
					o.setAttribute('pollenID',_id);
					o.className += "pollinated";
				}else{
					o.isPollinated = true;
					o.pollenID = _id;
				}

				if(!isDOM && !o.hasDefaultNodes){ 
					addDefaultNodes(o);
				}
			
				if(!_isDOM){
							
					o.hasNode = function(p){
						return o.nodes[p];
					}
			
					o.setNode = function(p,v){
						o.nodes[p].set(v);
						Pollen.exchange.report(o.pollenID,p,v,"Pollinate.setNode");
					}
			
					o.getNode = function(p){
						return o.nodes[p].get();
					}
				}
			
			}
		}
			
    };
        
       
})();













           

