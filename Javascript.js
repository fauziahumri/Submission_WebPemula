const books = [];
const renderEvent = 'render-book';
const savedEvent = 'saved-book';
const storage_k = 'BOOK_APPS';

function generateBookObject(id, title, author, year, Completed) {
  return {
    id,
    title, 
    author, 
    year,
    Completed
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBookData();
    clearInputField();
    popUpSucces('Buku Telah Ditambahkan!');
  });

  if(isStorageExist()){
    loadDataFromLocalStorage();
  }

});


function addBookData(){
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const readStatusCheckbox = document.getElementById('inputBookComplete').checked;


  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, readStatusCheckbox);
  books.push(bookObject);

  document.dispatchEvent(new Event(renderEvent));

  saveBookData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, Completed){
  return{
    id,
    title,
    author,
    year,
    Completed
  }
}

document. addEventListener(renderEvent, function(){

  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  incompleteBookshelfList.innerHTML = '';

  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';

  for(const bookItem of books){
    const bookElement = makeListBooksRead(bookItem);
    if(!bookItem.Completed){
      incompleteBookshelfList.append(bookElement);
    }else{
      completeBookshelfList.append(bookElement);
    }   
  }
});

function makeListBooksRead(bookObject){
  const textBookTitle = document.createElement('h3');
  textBookTitle.innerText = bookObject.title;

  const textBookAuthor = document.createElement('p');
  textBookAuthor.innerText = 'Penulis : ' + bookObject.author;

  const textBookYear = document.createElement('p');
  textBookYear.innerText = 'Tahun : ' + bookObject.year

  const btnContainer = document.createElement('div');
  btnContainer.classList.add('action');

  const btnDelete = document.createElement('button');
  btnDelete.classList.add('red');
  btnDelete.setAttribute('id', 'btn-delete');
  btnDelete.innerText = 'Hapus Buku';

  const articleContainer = document.createElement('article');
  articleContainer.classList.add('book_item');
  articleContainer.append(textBookTitle, textBookAuthor, textBookYear, btnContainer);

  articleContainer.setAttribute('id', `book-${bookObject.id}`);


  if(bookObject.Completed){
    const btnUndoFinished = document.createElement('button');
    btnUndoFinished.classList.add('green');
    btnUndoFinished.setAttribute('id', 'btn-undo');
    btnUndoFinished.innerText = 'Belum Selesai Dibaca';

    btnContainer.append(btnUndoFinished, btnDelete);

    btnUndoFinished.addEventListener('click', function(){
      undoBookFromCompleted(bookObject.id);
      popUpSucces('Undo Success');
    });

    btnDelete.addEventListener('click', function(){
      swal({
        title: "apakah anda akan menghapus data?",
        text: "Jika data buku dihapus maka akan hilang dari penyimpanan",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
          deleteBookData(bookObject.id);
          swal("Data Buku Berhasil di Hapus", {
            icon: "success",
            button: false,
            timer: 1000
          });
        } else {
          swal("Data Buku Aman!", {
            button: false,
            timer: 1000
          });
        }
      });
    });

  }else{
    const btnFinish = document.createElement('button');
    btnFinish.classList.add('green');
    btnFinish.setAttribute('id', 'btn-finish');
    btnFinish.innerText = 'Selesai Dibaca';

    btnContainer.append(btnFinish, btnDelete);

    btnFinish.addEventListener('click', function(){
      addBookToCompleted(bookObject.id);
      popUpSucces('SELAMAT! anda telah menyelesaikan membaca')
    });

    btnDelete.addEventListener('click', function(){
      swal({
        title: "apakah anda akan menghapus data?",
        text: "Jika data buku dihapus maka akan hilang dari penyimpanan",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
          deleteBookData(bookObject.id);
          swal("Data Buku Berhasil di Hapus", {
            icon: "success",
            button: false,
            timer: 1000
          });
        } else {
          swal("Hapus data buku dibatalkan", {
            button: false,
            timer: 1000
          });
        }
      });
    });

  }
  
  return articleContainer;
}

//Fungsi untuk membersihkan form inputan data buku
function clearInputField(){
  const bookTitle = document.getElementById('inputBookTitle');
  const bookAuthor = document.getElementById('inputBookAuthor');
  const bookYear = document.getElementById('inputBookYear');
  document.getElementById('inputBookComplete').checked = null;

  bookTitle.value = '';
  bookAuthor.value = '';
  bookYear.value = '';
}

function addBookToCompleted(bookId){
  const bookTarget = findBook(bookId);

  if(bookTarget == null) return;

  bookTarget.Completed = true;
  document.dispatchEvent(new Event(renderEvent));
  saveBookData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function deleteBookData(bookId){
  const bookTarget = findBookIndex(bookId);

  if(bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(renderEvent));
  saveBookData();
}

function undoBookFromCompleted(bookId){
  const bookTarget = findBook(bookId);

  if(bookTarget == null) return;

  bookTarget.Completed = false;
  document.dispatchEvent(new Event(renderEvent));
  saveBookData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
 
  return -1;
}

function saveBookData(){
  if(isStorageExist()){
    const parsed = JSON.stringify(books);
    localStorage.setItem(storage_k, parsed);
    document.dispatchEvent(new Event(savedEvent));
  }
}

function isStorageExist(){
  if(typeof(Storage) ===undefined){
    alert('Local Storage Tidak Mendukung');
    return false;
  }

  return true;
}


function loadDataFromLocalStorage(){
  const serializedData = localStorage.getItem(storage_k);
  let data = JSON.parse(serializedData);

  if(data !== null){
    for(const book of data){
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(renderEvent));
}

//fungsi untuk mencari buku
const searchBookTitle = document.querySelector('#searchBookTitle');
searchBookTitle.addEventListener('keyup', pencarianList);
 
function pencarianList(e){
  const searchBookTitle = e.target.value.toLowerCase();
  let itemList = document.querySelectorAll('.book_item > h3');

  itemList.forEach((item) =>{
    const listBookItem = item.textContent.toLowerCase();

    if(listBookItem.indexOf(searchBookTitle) != -1){
      item.parentElement.setAttribute('style', 'display: block;');
    }else{
      item.parentElement.setAttribute('style', 'display: none !important;');
    }

  })
}

//Fungsi untuk memunculkan PopUp menggunakan Sweetalert
function popUpSucces(text){
  swal({
    title: "success",
    text: text,
    icon: "success",
    button: false,
    timer: 2000
});
}






