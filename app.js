//budget controller
var budgetController = (function () {

    //some code

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);

        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;

        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create a new item based on 'inc' or 'exp' type

            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //push it onto our data structure
            data.allItems[type].push(newItem);

            //return the item
            return newItem;

        },

        deleteItem: function(type, id){
            var ids, index;


            //id is 6
            //data.allitems[type][id];
            // ids = [1, 2, 4, 6];
            //index = 3

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){

            //calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;


            //calculate the percentage of income that we spent

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },

        calculatePercentages: function(){

            /*
            * a = 20
            * b = 10
            * c = 40
            *
            * income = 100
            *
            * a/100 = 20%
            * b/100 = 10%
            * c/100 = 40%
            * */

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);

            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function (cur) {
               return cur.getPercentage();
            });

            return allPerc;

        },

        getBudget: function(){
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          };
        },

        testing: function(){
            console.log(data);
        }
    }

})();

var UIController = (function() {

    //some code
    var DOMstrings = {
        getType: '.add__type',
        getDescription: '.add__description',
        getValue: '.add__value',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        container: '.container',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.getType).value,
                description: document.querySelector(DOMstrings.getDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.getValue).value)
            };
        },

        getDOMstrings: function(){
            return DOMstrings;
        },

        displayBudget: function(obj){

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0){

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        deleteListItem: function(selectorID){
            var ele = document.getElementById(selectorID);

            ele.parentNode.removeChild(ele);


        },

        clearFields: function(){
            var fields, fieldsArr;

          fields = document.querySelectorAll(DOMstrings.getDescription + ', ' + DOMstrings.getValue);

          fieldsArr = Array.prototype.slice.call(fields);

          fieldsArr.forEach(function (current, index, array) {
              current.value = "";
              
          });

          fieldsArr[0].focus();
        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            //create html string with placeholder text+
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">' +
                    '<i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">' +
                    '<div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }


            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        }
    };

})();

var controller = (function() {


    var setupEventListeners = function(){

        var DOM = UIController.getDOMstrings();

        document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            //some code
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);

    };

    //some code
    var updateBudget = function(){

        //calculate the budget
        budgetController.calculateBudget();

        //return the budget
        var budget = budgetController.getBudget();


        //display the budget
        UIController.displayBudget(budget);
    };
    
    var updatePercentages = function () {

        // 1. calculate percentages
        budgetController.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetController.getPercentages();
        // 3. Update the UI with the new percentages
        console.log(percentages);
    };


    var ctrlAddItem = function(){
        var input, newItem;

        // Get the field data input
        input = UIController.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);


            //Add the item to the UI
            UIController.addListItem(newItem, input.type);

            //Clear the fields
            UIController.clearFields();

            //calculate and update the budget
            updateBudget();

            //calculate and update percentages
            updatePercentages();
        }




    };

    var ctrlDelItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetController.deleteItem(type, ID);

            // 2. delete item from the UI
            UIController.deleteListItem(itemID);

            // 3. upgrade and show the new budget
            updateBudget();

            // 4 calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function(){
            console.log("Application has started.");
            setupEventListeners();
        }
    }


})(budgetController, UIController);

controller.init();

