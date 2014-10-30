var myForm = document.getElementById("create");
var list = document.getElementById("signUp");
console.log(list);
var k = 0;
myForm.addEventListener("submit", function (event) {
		console.log(list);
    // prevent the data from being sent to the server
    event.preventDefault();

    // add your code to deal with the user's data here.
    // if your form has an text field  with a `name` (not `id`) of
    // taco, then you can access what the user typed with:

	var p = document.createElement("p"); //create container paragraph
  var cLabel = document.createElement("label");
  cLabel.setAttribute("for","class["+k+"]");
  cLabel.innerHTML = "Class";
  //create label for the class input
	var cInput = document.createElement("input");
  cInput.setAttribute("type","text");
  cInput.setAttribute("name","classes["+k+"][name]");
  cInput.setAttribute("id","class["+k+"]");
  //create class input can acces through req.body.sites(.forEach / [i].class) 
  var uLabel = document.createElement("label");
  uLabel.setAttribute("for","url["+k+"]");
  uLabel.innerHTML = "URL";
  //create label for the url input
	var uInput = document.createElement("input");
	uInput.setAttribute("type","url");
  uInput.setAttribute("name","classes["+k+"][url]");
  uInput.setAttribute("id","url["+k+"]");
  //create url input can acces through req.body.sites(.forEach / [i].url) 


	p.appendChild(cLabel);
	p.appendChild(cInput);
	p.appendChild(document.createTextNode(" "));
	p.appendChild(uLabel);
	p.appendChild(uInput);
	//stick everything inside the container paragraph with a space between
	list.insertBefore(p, document.getElementById("submit"));
	//stick the container paragraph at the end before the submit button
	k += 1;
	});