function get(){
    var txt = document.getElementById('text').value.trim();
    var list = document.getElementById('list');

    if(txt !== '' && txt.length >= 2 && txt.length <= 50 && !/\d/.test(txt)){
        if(!checkDuplicate(list , txt)){
            var listItem = createListItem(txt);
            var listItemData = {
                text: txt,
                done: false,
                subItems: []
            };
            listItem.data = listItemData;
            list.appendChild(listItem);
            document.getElementById('text').value = '';
            saveToLocalStorage(listItemData);

        }else{
            alert('Kjo detyrë është tashmë në listë.');
        }
    }else {
        alert('Teksti duhet të jetë midis 2 dhe 50 karaktereve, të mos jetë bosh dhe të mos përmbajë numra.');
    }
}
document.getElementById('add').addEventListener('click', get);

function createListItem(txt){
    var listItem = document.createElement('li');
    listItem.innerHTML = `
    <input type='checkbox'>
    <span>${txt}</span>
    <button class='btn-edit' onclick='editTask(this)'>Edit</button>
    <button class='btn-delete' onclick='deleteItem(this)'> Delete </button>
    <button class='btn-add' onclick='addItem(this)'>Add </button> `;

    listItem.querySelector('input[type="checkbox"]').addEventListener('change' , function(){
        itemDone(this);
    });
    return listItem;
}
function itemDone(checkbox){
    var listItem = checkbox.parentNode;
    var listItemData = listItem.data;
   
    listItemData.done = checkbox.checked;

    if(listItemData.subItems.length > 0){
        listItemData.subItems.forEach(function(subitem){
            subitem.done = listItemData.done;
        });
        listItem.querySelectorAll('.sub-item input[type="checkbox"]').forEach(function (subCheckbox) {
            subCheckbox.checked = listItemData.done;
        });     
    }

    updateItemInLocalStorage(listItemData);
}
function subitemDone(checkbox){
    var listItem = checkbox.parentNode.parentNode;
    var listItemData = listItem.data;
    var subItemData = checkbox.parentNode.data;
    subItemData.done = checkbox.checked;
    var allSubitemsDone = listItemData.subItems.every(function(subitem) {
        return subitem.done;
    });
    listItem.querySelector('input[type="checkbox"]').checked = allSubitemsDone;
    listItemData.done = allSubitemsDone;  
    updateItemInLocalStorage(listItemData);
}
function checkDuplicate(list , txt){
    var items = document.getElementsByTagName('li');
    for(var i = 0 ; i < items.length ; i++){
        var itemText = items[i].data.text;
        if(itemText === txt || checkDuplicateSubitem(items[i] , txt)){
            return true;
        }
    } 
    return false;
}
function checkDuplicateSubitem( item , txt){
    var subitems = item.data.subItems || [];
    for (var i = 0 ; i < subitems.length ; i++){
        var subitemText = subitems[i].text;
        if( subitemText === txt){
            return true;
        }
    }
    return false;
}
function saveToLocalStorage(itemData){
    var doList = JSON.parse(localStorage.getItem('toDoList')) || [];
    doList.push(itemData);
    localStorage.setItem('toDoList' , JSON.stringify(doList));
}
function deleteItem(button){
    var listItem = button.parentNode;
    var listItemData = listItem.data;
    var doList = JSON.parse(localStorage.getItem('toDoList'));
    removeFromLocalStorage(doList , listItemData);
    listItem.remove();
}
function removeFromLocalStorage(doList , listItemData){
    var index = findIndexLocalStorage(doList , listItemData)
   doList.splice(index , 1);
   localStorage.setItem('toDoList' , JSON.stringify(doList));
}
function findIndexLocalStorage(doList , listItemData){
    var txt = listItemData.text;
    for(var i = 0 ; i < doList.length ; i++){
        if(doList[i].text === txt){
            return i;
        }
    }
    return -1;
}
function addItem(button){
    var listItemParent = button.parentNode;
    var listItemParentData = listItemParent.data;
    var txt = document.getElementById('text').value.trim();
    if(txt !== '' && txt.length >= 2 && txt.length <= 50 && !/\d/.test(txt)){
        if(!checkDuplicate(list , txt)){
            var listItem = createSubitem(txt);
            var listItemData = {
                text: txt,
                done: false
            };
            listItem.classList.add('sub-item');
            listItem.data = listItemData;
            listItemParent.appendChild(listItem);
            listItemParentData.subItems.push(listItemData);
            document.getElementById('text').value = '';

            if (listItemParentData.done) {
                listItem.querySelector('input[type="checkbox"]').checked = true;
                listItemData.done = true;
            }

            updateItemInLocalStorage(listItemParentData);

        }else{
            alert('Kjo detyrë është tashmë në listë.');
        }
    }else {
        alert('Teksti duhet të jetë midis 2 dhe 50 karaktereve, të mos jetë bosh dhe të mos përmbajë numra.');
    }
}
function createSubitem(txt){
    var listItem = document.createElement('li');
    listItem.innerHTML = `
        <input type='checkbox'>
        ${txt}
        <button class='btn-delete' onclick='deleteSubitem(this)'>Delete</button> `;
        listItem.querySelector('input[type="checkbox"]').addEventListener('change' , function(){
            subitemDone(this);
        });
        return listItem;
}
function updateItemInLocalStorage(listItemData){
    var doList = JSON.parse(localStorage.getItem('toDoList'));
    let index = findIndexLocalStorage(doList , listItemData);
    doList[index] = listItemData;
    localStorage.setItem('toDoList' , JSON.stringify(doList));
}
function deleteSubitem(subitem) {
    var listItem = subitem.parentNode.parentNode; 
    var listItemData = listItem.data;
    var subItemData = subitem.parentNode.data;
    listItemData.subItems = listItemData.subItems.filter(function(item){
        return item.text !== subItemData.text;
    }); 
   
    var allSubitemsDone = listItemData.subItems.every(function(subitem) {
        return subitem.done;
    });
    listItem.querySelector('input[type="checkbox"]').checked = allSubitemsDone;
    listItemData.done = allSubitemsDone;

    updateItemInLocalStorage(listItemData);
    subitem.parentNode.remove();
}
function fromLocalStorage() {
    var doList = JSON.parse(localStorage.getItem('toDoList')) || [];
    var list = document.getElementById('list')
    
    doList.forEach(function (itemData) {
        var listItem = createListItem(itemData.text);

        listItem.data = itemData;
        list.appendChild(listItem);
        listItem.querySelector('input[type="checkbox"]').checked = itemData.done;
        if (itemData.subItems.length > 0) {
            itemData.subItems.forEach(function (subitem) {
                var listSubitem = createSubitem(subitem.text);
                listSubitem.classList.add('sub-item');
                listSubitem.data = subitem;
                listSubitem.querySelector('input[type="checkbox"]').checked = subitem.done;
                listItem.appendChild(listSubitem);
            });
        }
    });
}
fromLocalStorage();

function editTask(button) {
    var listItem = button.parentNode;
    var listItemData = listItem.data;
    var doList = JSON.parse(localStorage.getItem('toDoList'));
    var newText = document.getElementById('text').value.trim();
    var index = findIndexLocalStorage(doList, listItemData);

    if (newText !== null && newText !== '' && newText.length >= 2 && newText.length <= 50 && !/\d/.test(newText)) {
        if (!checkDuplicate(document.getElementById('list'), newText)) {
        listItemData.text = newText;
        listItem.querySelector('span').innerText = newText;

        doList[index] = listItemData;
        localStorage.setItem('toDoList', JSON.stringify(doList));
    }else{
        alert('Kjo detyrë është tashmë në listë.');
    }
    }else {
    alert('Teksti duhet të jetë midis 2 dhe 50 karaktereve, të mos jetë bosh dhe të mos përmbajë numra.');
}

    document.getElementById('text').value = '';
}



