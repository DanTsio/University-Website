let jwtToken;

var activeFile, activeTable;

function displaySide(asideID, buttonID) {

    clearMain();

    // Παίρνω όλα τα div στοιχεία που είναι μέσα στο aside και όλα τα στοιχεία τύπου button που βρίσκονται στο nav
    var divs = document.querySelectorAll('aside > div');
    var buttons = document.querySelector('nav').getElementsByTagName('button');

    // Αφού το button έχανε την κατάσταση focus που είχα θέσει στο css αρχείο, αλλάζω το background
    // χρώμα του button που έχει επιλεχθεί για να έχει το ίδιο effect 
    for (let i = 0; i < 5; i++) {
        buttons.item(i).style = '';
    }
    buttons.item(buttonID).style = 'background-color: #915e00; color: white;';

    // Θέτω το display σε none για όλα τα div στοιχεία
    for (let i = 0; i < divs.length; i++) {
        divs[i].style.display = 'none';
    }

    // Και εμφανίζω μόνο αυτό που επιλέχθηκε
    document.getElementById(asideID).style.display = 'block';
}

function clearMain(){

    var divs = document.querySelectorAll('main > div');
    
    for (let i = 0; i < 4; i++) {
        divs[i].style.display = 'none';
        divs[i].innerHTML = '';
    }

    // Αφού έχουμε HTML κώδικα στα τελευταία 5 div στοιχεία του main δεν θέλουμε να εκτελέσουμε innerHTML = '' σε όλα τα div
    // έτσι θέτω το display = 'none' για κάθε div στοιχείο το οποίο θέλω να διατηρήσω τον HTML κώδικα

    document.getElementById('LoginFormID').style.display = 'none'
    document.getElementById('songForm').style.display = 'none'
    document.getElementById('songToolbar').style.display = 'none'
    document.getElementById('linkForm').style.display = 'none'
    document.getElementById('linkToolbar').style.display = 'none'

}

function clearImages() {
    document.getElementById('ImageContainerID').innerHTML = '';
}

function getImages(imageSet) {
    
    const Menu = document.getElementById('ImageContainerID');

    Menu.style.display = 'flex';
    
    clearImages();

    fetch(`api/images/${imageSet}`) 
        .then(response => response.json())
        .then(imageFiles => {
            imageFiles.forEach(file => {
                const img = document.createElement('img');
                img.src = `/images/${imageSet}/${file}`; 
                img.classList.add('image'); 
                Menu.appendChild(img);
            });
        })
    .catch(error => console.error('Error fetching images:', error));
}

function getInformation(fileName) {

    clearMain();

    fetch(`api/Biography/${fileName}`)
    .then(response => {
        return response.text();
    })
    .then(text => {
        const contentDiv = document.getElementById('BiographyContainerID');
        contentDiv.style.display = 'block';
        contentDiv.textContent = text;
    })
}

function getDiscNoForm(fileName) {
    clearMain();
    fetch(`api/Discography/${fileName}`)
    .then((res) => res.json())
    .then((json) => showDiscography((json)))
}

function getDisc(fileName) {
    clearMain();
    fetch(`api/Discography/${fileName}`)
    .then((res) => res.json())
    .then((json) => showDiscography((json)))
    .then(() => {
        document.getElementById('songForm').style.display = 'flex'
        document.getElementById('songToolbar').style.display = 'flex'
    })
}

function getFormData() {
    let aSong = {
        id: document.querySelector("#songForm [name='id']").value,
        title: document.querySelector("#songForm [name='title']").value,
        duration: document.querySelector("#songForm [name='duration']").value,
        artist: document.querySelector("#songForm [name='artist']").value
    };
    return JSON.stringify(aSong);
}

function showDiscography(Album) {

    const DiscContainer = document.getElementById("DiscographyContainerID");

    if( !(jwtToken == "" || jwtToken == undefined) ) {
        DiscContainer.addEventListener("click", selectSong);
    }
    else{
        DiscContainer.removeEventListener("click", selectSong)
    }

    DiscContainer.style.display = 'flex';

    let Table = `<table class="TableStyle"><tr><th>Id</th>
        <th>Title</th><th>Duration</th><th>Artist</th></tr>`
    for (let aSong of Album) {
        Table += `<tr>
            <td>${aSong.id}</td>
            <td>${aSong.title}</td>
            <td>${aSong.duration}</td>
            <td>${aSong.artist}</td>
            </tr>`;
    
    }
    Table += "</table>";
    document.getElementById("DiscographyContainerID").innerHTML = Table;
}

function showLogin(){
    clearMain();
    document.getElementById('LoginFormID').style.display = 'flex'
}

function logout(){
    document.getElementById("LoggedInStatus").innerText = "Logged Out";
    document.getElementById("ManageSongs").style.display = 'none';
    document.getElementById("ManageLinks").style.display = 'none';
    jwtToken="";
    clearMain();
}

function Login() {
    jwtToken="";
    let credentials = {
        username: document.querySelector("[name='username']").value,
        password: document.querySelector("[name='password']").value
    }
    fetch("/login", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(credentials)
    })
        .then((res) => res.json())
        .then((json) => {
            if (json) {
                jwtToken = json;
                document.querySelector("[name='username']").value = "";
                document.querySelector("[name='password']").value = "";
                document.getElementById("LoggedInStatus").innerText = "Logged in";
                document.getElementById("ManageSongs").style.display = 'block';
                document.getElementById("ManageLinks").style.display = 'block';
            }
        })
        .catch(e => alert("Failed to login"));
}

function getData() {
    fetch("/api/data", {
        headers: {
            Authorization: `Bearer ${jwtToken}`
        },
        method: "GET"
    })
    .catch(e => showError(e))
    .then((res) => res.json())
    .then((json) => showData((json)))
    .catch(e => showError(e));
}

function showError(error) {
    console.log(error);
}

function selectSong(event) {
    if (!event.target.outerHTML.startsWith("<td>")) return;
    let aRow = event.target.parentNode;
    let inputs=document.querySelectorAll("#songForm input");
    for (let i=0; i < inputs.length; i++){
        inputs[i].value = aRow.children[i].innerText;
    } 
    let rows = [...aRow.parentNode.children];
    rows.forEach((r => r.classList.remove("selected")));
    aRow.classList.add("selected");            
}

function getDiscFiles(){

    clearMain();
    
    const Menu = document.getElementById('DiscographyContainerID');
    
    Menu.style.display = 'block';

    fetch('api/Discography')
    .then(response => response.json())
        .then(imageFiles => {
            imageFiles.forEach(file => {
                const button = document.createElement('button');
                button.classList = 'Button Side';
                button.style = 'max-width: 500px;display: flex; flex-direction:column; margin:10px auto;';
                button.textContent = file;
                button.addEventListener('click', () => {
                activeFile = file;
                getDisc(file);
            });
            Menu.appendChild(button);
        });
    })
}

function addSong() {
    let bodyData = getFormData();
    fetch(`/api/Discography/${activeFile}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: bodyData
    })
        .then((res) => res.json())
        .then((json) => {
            alert(json);
            getDisc(activeFile);
        })
        .catch((err) => alert("error:", err));
}

function updateSong() {
    let bodyData = getFormData();
    fetch(`/api/Discography/${activeFile}/`+bodyData.id, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: bodyData
    })
        .then((res) => res.json())
        .then((json) => {
            alert(json);
            getDisc(activeFile);
        })
        .catch((err) => alert("error:", err));
}

function deleteSong() {
    let bodyData = getFormData();
    fetch(`/api/Discography/${activeFile}/`+bodyData.id, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "DELETE",
        body: bodyData
    })
        .then((res) => res.json())
        .then((json) => {
            alert(json);
            getDisc(activeFile);
        })
        .catch((err) => alert("error:", err));
}

function getLinksNoForm(tableName) {
    clearMain();
    fetch(`api/Links/${tableName}`)
    .then((res) => res.json())
    .then((json) => showLinks((json)))
}

function getLinks(tableName) {
    clearMain();
    fetch(`api/Links/${tableName}`)
    .then((res) => res.json())
    .then((json) => showDiscography((json)))
    .then(() => {
        document.getElementById('linkForm').style.display = 'flex'
        document.getElementById('linkToolbar').style.display = 'flex'
    })
}

function showLinks(Links) {

    const LinkContainer = document.getElementById("LinksContainerID");

    if( !(jwtToken == "" || jwtToken == undefined) ) {
        LinkContainer.addEventListener("click", selectLink);
    }
    else{
        LinkContainer.removeEventListener("click", selectLink)
    }

    LinkContainer.style.display = 'flex';

    let Table = `<table class="TableStyle"><tr><th>Id</th>
        <th>Link</th><th>Description</th></tr>`
    for (let aLink of Links) {
        Table += `<tr>
            <td>${aLink.id}</td>
            <td><a href="${aLink.link}">${aLink.link}</a></td>
            <td>${aLink.description}</td>
            </tr>`;
    }
    Table += "</table>";
    document.getElementById("LinksContainerID").innerHTML = Table;
}

function showTables() {

    tables = ['videos','live','information']

    clearMain();

    const Menu = document.getElementById('LinksContainerID');

    Menu.style.display = 'block';

    for (let i = 0; i < 3; i++) {
        const button = document.createElement('button');
        button.classList = 'Button Side';
        button.style = 'max-width: 500px;display: flex; flex-direction:column; margin:10px auto;';
        button.textContent = tables[i];
        button.addEventListener('click', () => {
        activeTable = tables[i];
        getTable(tables[i]);
        });
        Menu.appendChild(button)
    }

}

function selectLink(event) {
    if (!event.target.outerHTML.startsWith("<td>")) return;
    let aRow = event.target.parentNode;
    let inputs=document.querySelectorAll("#linkForm input");
    for (let i=0; i < inputs.length; i++){
        inputs[i].value = aRow.children[i].innerText;
    } 
    let rows = [...aRow.parentNode.children];
    rows.forEach((r => r.classList.remove("selected")));
    aRow.classList.add("selected");            
}

function getTable(Table) {
    clearMain();
    fetch(`/api/Links/${Table}`)
    .then((res) => res.json())
    .then((json) => showLinks((json)))
    .then(() => {
        document.getElementById('linkForm').style.display = 'flex'
        document.getElementById('linkToolbar').style.display = 'flex'
    })
}

function getLinkData() {
    let aLink = {
        id: document.querySelector("#linkForm [name='id']").value,
        link: document.querySelector("#linkForm [name='link']").value,
        description: document.querySelector("#linkForm [name='description']").value
    };
    return JSON.stringify(aLink);
}

function addLink() {
    let bodyData = getLinkData();
    fetch(`/api/Links/${activeTable}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: bodyData
    })
        .then((res) => res.json())
        .then((json) => {
            alert(json);
            getTable(activeTable);
        })
        .catch((err) => alert("error:", err));
}

function updateLink() {
    let bodyData = getLinkData();
    fetch(`/api/Links/${activeTable}/`+bodyData.id, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: bodyData
    })
        .then((res) => res.json())
        .then((json) => {
            alert(json);
            getTable(activeTable);
        })
        .catch((err) => alert("error:", err));
}

function deleteLink() {
    let bodyData = getLinkData();
    fetch(`/api/Links/${activeTable}/`+bodyData.id, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "DELETE",
        body: bodyData
    })
        .then((res) => res.json())
        .then((json) => {
            alert(json);
            getTable(activeTable);
        })
        .catch((err) => alert("error:", err));
}
