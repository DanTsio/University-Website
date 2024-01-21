function displaySide(ID, buttonID) {

    clearMain();
    
    // Get all div elements inside the aside
    var divs = document.querySelectorAll('aside > div');
    var buttons = document.querySelector('nav').getElementsByTagName('button');
    
    for (let i = 0; i < 5; i++) {
        buttons.item(i).style.backgroundColor = '#deb887';
        buttons.item(i).style = '';
    }
    
    buttons.item(buttonID).style.backgroundColor = '#a1845e';
    
    // Hide all divs
    for (let i = 0; i < divs.length; i++) {
        divs[i].style.display = 'none';
    }
    
    // Display the div associated with the clicked button
    var selectedDiv = document.getElementById(ID);
    selectedDiv.style.display = 'block';
}

function clearMain(){
    document.getElementById('mainMenu').innerHTML = '';
}

function getImages(imageSet) {
    
    const Menu = document.getElementById('mainMenu');

    clearMain();

    const imageContainer = document.createElement('div');
    imageContainer.className = "imageContainer";
    Menu.appendChild(imageContainer);

    fetch(`public/images/${imageSet}`) // Fetch the list of images from your server
        .then(response => response.json())
        .then(imageFiles => {
            imageFiles.forEach(file => {
                const img = document.createElement('img');
                img.src = `/images/${imageSet}/${file}`; // Adjust the path based on your server setup
                img.classList.add('image'); // Optional: Add a class for styling
                imageContainer.appendChild(img);
            });
        })
    .catch(error => console.error('Error fetching images:', error));
}

function getInformation(fileName) {

    clearMain();

    fetch(`public/Biography/${fileName}`)
    .then(response => {
        return response.text();
    })
    .then(text => {
        // Displaying the fetched data in the div element
        const contentDiv = document.getElementById('mainMenu');
        contentDiv.textContent = text; // Set the text content of the div
    })
}

function getDisc(fileName) {
    fetch(`public/Discography/${fileName}`)
    .then((res) => res.json())
    .then((json) => showDiscography((json)))
}

function showDiscography(Album) {

    clearMain();

    let Table = `<table><tr><th>Id</th>
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
    document.getElementById("mainMenu").innerHTML = Table;
}

// function getLinks(fileLinks) {
//     fetch(`public/Discography/${}`)
// }