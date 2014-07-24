#pollen


###overview

pollen is a basic framework for building connections and binding between js objects and DOM objects.
It is very much a work in progress.


####basic usage

#####pollinating a js object

<html><body>

var myObj = {myValue:0};

to expose some connectable nodes we create a node object

myObj.nodes = {

  myNode:{
	  type:"number",
		label:"myNode",
		desc:"My favourite node",
		get:function(){ return myObj.myValue; },
		set:function(v){
			myObj.myValue = v;
			Pollen.exchange.report(myObj.pollenID,"myNode",v);
		}
	}

};

</body><html>

the fields type, label, desc are purely for ide or other descriptive use

now we can pollinate our object so it is ready to connect

<html><body>Pollen.pollinate(myObj);</body></html>

it is now ready to use

this is how we connect it's to another node

<html><body>Pollen.exchange.connect(myObj,'myNode',myOtherObj,'myOtherNode');</body></html>

the two nodes are now connected

you can set a node value explicitly like this

<html><body>myObj.setNode('myNode',123);</body></html>

in this case the value of the node myOtherNode on the object myOtherObject would instantly become 123

we can also report a change to a node arbitarily

<html><body>Pollen.exchange.report(myObj.pollenID,"myNode",v,"some msg for debugging if needed");</body></html>

you might notice we do this in the set method of the example node. this keeps the data flowing around the system
why don't we just automatically watch this value? well, sometimes you might need to do complex calculations before 
sending off the value or you might even want to stop propagation and instead trigger a different node


#####pollinating a dom object

dom elements work in a similar way

<html><body>

<input id="myInput" type="text">

<script>

  Pollen.pollinate(document.getElementById('myInput'));

</script>

</body></html>

dom elements can use either attributes or properties as nodes, so in the case of this <input> object either type or value would work

we can also link js objects and dom objects together, here is a basic calculator example below 

<html>
  <body>
  
    <h3>The Adder</h3>
    </br>
    <label>Add Number</label><input id="add" type="text">
    </br>
    <label>Result</label><input id="res" type="text">
  
    <script>
      
      var a = document.getElementById('add');
      var r = document.getElementById('res');
      
      // pollinate our dom objects
      
      Pollen.pollinate(a,r);
      
      // now we will create an instance of pollen's built in calculator object to perform the addition logic
      // note: objects created from the pollen factory are pre-pollinated.
    
      var c = Pollen.factory.make('logic.calculator');
      
      // now we are ready to wire everything up
      
      Pollen.exchange.connect(a,'value',c,'add'); // connect the first input to the calculator obj
      Pollen.exchange.connect(c,'value',r,'value'); // connect calculator obj value the result input
      
      // And we are done!
      
    
    </script>
  
  </body>

</html>




















