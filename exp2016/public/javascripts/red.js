$(document).ready(function(){ 

    document.getElementById("change").onclick = function() {
    	var temp;
    	temp = document.getElementById("sel1").value; 
    	document.getElementById("sel1").value = document.getElementById("sel2").value;
    	document.getElementById("sel2").value = temp;

       if(calc.year.value==='' || calc.month.value === '' || calc.day.value ===''){
         var url = "/przelicznik/" + calc.from.value + "-na-" + calc.on.value + "-" + calc.focusedInput.value + "-" + calc.from.value + "-ile-to-" + calc.on.value;
      } else {
        var url = "/przelicznik/" + calc.year.value +"-" + calc.month.value + "-" +calc.day.value + "/" + calc.from.value + "-na-" + calc.on.value + "-" + calc.focusedInput.value + "-" + calc.from.value + "-ile-to-" + calc.on.value;
    }
        window.location.href = url;
    }


  document.getElementById("red").onclick = function() {
    if(calc.year.value==='' || calc.month.value === '' || calc.day.value ===''){
       var url = "/przelicznik/" + calc.from.value + "-na-" + calc.on.value + "-" + calc.focusedInput.value + "-" + calc.from.value + "-ile-to-" + calc.on.value;
    } else {
    var url = "/przelicznik/" + calc.year.value +"-" + calc.month.value + "-" +calc.day.value + "/" + calc.from.value + "-na-" + calc.on.value + "-" + calc.focusedInput.value + "-" + calc.from.value + "-ile-to-" + calc.on.value;
    }

    window.location.href = url;
  }

  document.getElementById("focusedInput").onkeypress = function(){
    if (event.keyCode == 13){
         $( "red" ).click();
      }
  }

  var enter = function(){
    var url = "/przelicznik/" + calc.year.value +"-" + calc.month.value + "-" +calc.day.value + "/" + calc.from.value + "-na-" + calc.on.value + "-" + calc.focusedInput.value + "-" + calc.from.value + "-ile-to-" + calc.on.value;
    window.location.href = url;
  }

});


