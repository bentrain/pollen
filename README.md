#pollen


###overview

pollen is a basic framework for building connections and binding between js objects and DOM objects.
It is very much a work in progress.


###basic usage


#####pollinating a js object


```javascript
var myObj = {myValue:0};
```
to expose some connectable nodes we create a node object
```javascript
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
```

the fields type, label, desc are purely for ide or other descriptive use

although is is not recommended we can also use lazy js object properties to join to

```javascript
var myLazyObj = {name:'myName'};
```
here we can join straight onto the property name but we lose the benefits of having getters and setters among other things

now we can pollinate our object so it is ready to connect

```javascript
Pollen.pollinate(myObj);
```
it is now ready to use

this is how we connect it's node to another node

```javascript
Pollen.exchange.connect(myObj,'myNode',myOtherObj,'myOtherNode');
```

the two nodes are now connected

you can set a node value explicitly like this

```javascript
myObj.setNode('myNode',123);
```

in this case the value of the node myOtherNode on the object myOtherObject would instantly become 123

we can also report a change to a node arbitarily

```javascript
Pollen.exchange.report(myObj.pollenID,"myNode",v,"some msg for debugging if needed");
```

you might notice we do this in the set method of the example node above. this keeps the data flowing around the system

why don't we just automatically watch this value? well, sometimes you might need to do complex calculations before 
sending off the value or you might even want to stop propagation and instead trigger a different node.

If you don't care for this you might use a lazy node as above


#####pollinating a dom object

dom elements work in a similar way

```html
<input id="myInput" type="text">

<script>

  Pollen.pollinate(document.getElementById('myInput'));

</script>
```

a dom element's attributes become joinable nodes

we can also link js objects and dom objects together, here is a basic calculator example below 

```html
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
```




















