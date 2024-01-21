let jwtToken;

var activeFile, activeTable;

function displaySide(ID, buttonID) {

    clearMain();

    // Get all div elements inside the aside
    var divs = document.querySelectorAll('aside > div');
    var buttons = document.querySelector('nav').getElementsByTagName('button');
    
    for (let i = 0; i < 5; i++) {
        buttons.item(i).style.backgroundColor = '#deb887';
        buttons.item(i).style = '';
    }
    
    buttons.item(buttonID).style = 'background-color: #915e00; color: white;';
    
    // Hide all divs
    for (let i = 0; i < divs.length; i++) {
        divs[i].style.display = 'none';
    }
    
    // Display the div associated with the clicked button
    var selectedDiv = document.getElementById(ID);
    selectedDiv.style.display = 'block';
}

function clearMain(){

    var divs = document.querySelectorAll('main > div');
    
    for (let i = 0; i < 4; i++) {
        divs[i].style.display = 'none';
        divs[i].innerHTML = '';
    }

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

    fetch(`api/images/${imageSet}`) // Fetch the list of images from your server
        .then(response => response.json())
        .then(imageFiles => {
            imageFiles.forEach(file => {
                const img = document.createElement('img');
                img.src = `/images/${imageSet}/${file}`; // Adjust the path based on your server setup
                img.classList.add('image'); // Optional: Add a class for styling
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
        // Displaying the fetched data in the div element
        const contentDiv = document.getElementById('BiographyContainerID');
        contentDiv.style.display = 'block';
        contentDiv.textContent = text; // Set the text content of the div
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

    // clearMain();

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
        .catch(e => showError(e));
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

    document.getElementById('LoginFormID').style.display = 'none'

    const Menu = document.getElementById('DiscographyContainerID');
    
    Menu.style.display = 'block';

    fetch('api/Discography')
    .then(response => response.json())
        .then(imageFiles => {
            imageFiles.forEach(file => {
                const button = document.createElement('button');
                button.classList = 'Button Side';
                button.style = 'max-width: 500px;display: flex; flex-direction:column; margin:10px auto;';
                button.textContent = file; // Set button label to file name
                button.addEventListener('click', () => {
                // Handle button click action, e.g., open the file or perform an action
                activeFile = file;
                Menu.addEventListener("click", selectSong);
                getDisc(file);
                // You can modify this to perform an action with the file
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

    // clearMain();

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

    document.getElementById('LoginFormID').style.display = 'none'

    const Menu = document.getElementById('LinksContainerID');

    Menu.style.display = 'block';

    for (let i = 0; i < 3; i++) {
        const button = document.createElement('button');
        button.classList = 'Button Side';
        button.style = 'max-width: 500px;display: flex; flex-direction:column; margin:10px auto;';
        button.textContent = tables[i];
        button.addEventListener('click', () => {
        activeTable = tables[i];
        Menu.addEventListener("click", selectLink);
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
