import "../css/popup.css";
import hello from "./popup/example";
//[FRONTEND]

//Creating a function to toggle a CSS rule which governs visibility
//For more info:
//https://stackoverflow.com/questions/19074171/how-to-toggle-a-divs-visibility-by-using-a-button-click
function openOutput() {
    var div = document.getElementById("output");
    div.style.display = div.style.display == "block" ? "none" : "block";
}
//Specifying the criteria by which 'openOutput()' is called with an EventListener
//In this case, when someone clicks the id="output-button" button in 'popup.html'.
document.getElementById("output-button").addEventListener('click', openOutput); //tells button to use openOutput on click
//---------------------------------------------------------------------------------------------------------------------------

//[BACKEND]
var currurl = window.location.href;

//Specifying the criteria by which 'getQuery()' is called with an EventListener
//In this case, when someone clicks the class="query-button" button in 'popup.html'
document.getElementById("query-form").addEventListener('submit',function(e) { //On query submit click, retrieve, store, and display the query
    e.preventDefault()
    ingred_list = getIngredients(currurl);
    console.log(ingred_list);
    populateHTML(ingred_list);
});

add_ul = function(passtext) {
    var ul = document.getElementById("popuplist");
    var li = document.createElement(passtext);
    var children = ul.children.length + 1
    li.setAttribute("id", "element"+children)
    li.appendChild(document.createTextNode("Element "+children));
    ul.appendChild(li)
}

//Creating a larger function which does several things:
// * Creates an XMLHttpRequest for use with a 'GET' request to the Edamam API and makes that request
// * Interprets and displays the JSON data from the Edamam API
// * If the Edamam API turns up nothing:
//   - Creates an XMLHttpRequest for use with a 'POST' request to the Nutritionix API and makes that request
//   - Interprets and displays the JSON data from the Nutritionix API
// * If the Nutritionix API turns up nothing:
//   - Displays an error message
function displayQuery(queryString) {
    //'GET' Request
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.edamam.com/api/food-database/parser?ingr='+queryString+'&app_id='+Cred.app_id+'&app_key='+Cred.app_key);
    request.onload = function() {
        try {
            var data = JSON.parse(request.responseText);
            if (data["parsed"].length < 1 || data["parsed"] == undefined){
                throw "error";
            }
            add_ul(data["parsed"][0]["food"]["label"]+": "+(data["parsed"][0]["quantity"])*(data["parsed"][0]["food"]["nutrients"]["ENERC_KCAL"])+" calories")
        }
        catch(err) 
        {
            //'POST' Request
            var request2 = new XMLHttpRequest();
            request2.open('POST', 'https://trackapi.nutritionix.com/v2/natural/nutrients' );
            request2.setRequestHeader( 'x-app-id',Cred.x_app_id );
            request2.setRequestHeader( 'x-app-key',Cred.x_app_key );
            request2.setRequestHeader( 'x-remote-user-id',Cred.x_remote_user_id );
            request2.setRequestHeader( 'Content-Type','application/json' );
            //https://blog.garstasio.com/you-dont-need-jquery/ajax/#posting
            //https://docs.google.com/document/d/1_q-K-ObMTZvO0qUEAxROrN3bwMujwAN25sLHwJzliK0/edit
            //https://gist.github.com/sgnl/bd760187214681cdb6dd
            var jsonData = { query: queryString };
            var myJSON = JSON.stringify(jsonData);
            request2.send(myJSON);
            request2.onload = function() {
                try {
                    var returnJSON = JSON.parse(request2.responseText);
                    var nutribool = returnJSON.hasOwnProperty('message');
                    if (nutribool == true)
                    {
                        throw error;
                    }
                    else
                    {
                        add_ul(returnJSON["foods"][0]["food_name"]+": "+returnJSON["foods"][0]["nf_calories"]+" calories");
                    }
                }
                catch(err) {
                    add_ul("Error: Error");
                }
            }
        }
    }
    request.send();
}

function populateHTML(ingred_list) {
    try {
        var count = ingred_list.length;
        for(var i = 0; i < count; i++) {
            var item = ingred_list.length[i];
            displayQuery(item);
        }
    }
    catch(err) {
        add_ul("populateHTML error")
    }
}