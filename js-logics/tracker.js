const userList = document.querySelector('#userList');
const form = document.querySelector('#addUser');

// and create an element and append retrieved data to the list
function userBase(doc) {
    let li = document.createElement('li');
    
    let name = document.createElement('span');
    let allMoney = document.createElement('span');
    let email = document.createElement('span');
    let deleteButton = document.createElement('div');

    li.setAttribute('data-id', doc.id);
    name.textContent = doc.data().name.charAt(0).toUpperCase() + doc.data().name.slice(1);
    allMoney.textContent = doc.data().allMoney;
    email.textContent = doc.data().email;
    deleteButton.textContent = 'x';
    
    li.appendChild(name);
    li.appendChild(allMoney);
    li.appendChild(email);
    li.appendChild(deleteButton);
    
    userList.appendChild(li);
}

//retrieving data
db.collection('users').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        userBase(doc);
    })});


//saving data
form.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('users').add({
        name: form.name.value,
        allMoney: form.allMoney.value,
        email: form.email.value
    });
    form.name.value = '';
    form.allMoney.value = '';
    form.email.value = '';
})

//deleting data
userList.addEventListener('click', (e) => {
    if (e.target.tagName === 'DIV') {
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection('users').doc(id).delete();
    }
})