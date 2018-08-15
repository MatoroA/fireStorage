import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { File } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera'


import firebase from 'firebase';


var config = {
  apiKey: "AIzaSyDR0DrZ9gPw0nFS69L1lCjFFIPlRZp384s",
  authDomain: "myproject-a2c67.firebaseapp.com",
  databaseURL: "https://myproject-a2c67.firebaseio.com",
  projectId: "myproject-a2c67",
  storageBucket: "myproject-a2c67.appspot.com",
  messagingSenderId: "637037822089"
};

//declare var firebase;
@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  type
  myPhoto
  imageURI;
  stringPic;
  stringVideo;
  stringAudio;
  upload;
  uploadFile={
    name:'',
    downloadUrl:''
  }
  fire;
  firebaseUploads;
  constructor(public navCtrl: NavController, public navParams: NavParams,private mediaCapture: MediaCapture, private camera: Camera,private platform : Platform, private f : File) {
    
    firebase.initializeApp(config);
    this.upload = firebase.database().ref('/upload/');
    this.firebaseUploads = firebase.database().ref('/fireloads/');
    
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }
  uploads(type) {
    this.type = type;
    console.log('upload clicked....')
    this.platform.ready().then(() => {
      let promise
      switch (type) {
        case 'camera':
          promise = this.mediaCapture.captureImage()
          this.myPhoto = promise;
          break
        case 'video':
          promise = this.mediaCapture.captureVideo()
          break
        case 'audio':
          promise = this.mediaCapture.captureAudio()
          break
      }
      console.log("+++"+this.myPhoto)
      promise.then((mediaFile: MediaFile[]) => {
        console.log(mediaFile)
       // this.presentLoading();
        this.imageURI = mediaFile[0].fullPath
        var name = this.imageURI.substring(this.imageURI.lastIndexOf('/')+1, this.imageURI.length);
        console.log(name);
       // this.presentLoading();
        switch (type) {
          case 'camera':
            this.stringPic = this.imageURI;
            this.uploadFile.name ="Camera Image"
            break
          case 'video':
          this.stringVideo = this.imageURI;
          this.uploadFile.name ="Video"
            break
          case 'audio':
          this.stringAudio = this.imageURI;
          this.uploadFile.name ="Audio"
            break
        }
        var directory: string = this.imageURI.substring(0, this.imageURI.lastIndexOf('/')+1);
        directory = directory.split('%20').join(' ')
        name = name.split('%20').join(' ')
        console.log(directory)
        console.log('About to read buffer')
        let seperatedName = name.split('.')
        let extension = ''
        if (seperatedName.length > 1) {
          extension = '.' + seperatedName[1]
        }
        return this.f.readAsArrayBuffer(directory, name).then((buffer: ArrayBuffer) => {
          console.log(buffer)
          console.log('Uploading file')
          var blob = new Blob([buffer], { type: mediaFile[0].type });
          console.log(blob.size);
          console.log(blob)
          const storageRef = firebase.storage().ref('files/' + new Date().getTime() + extension);
          return storageRef.put(blob).then((snapshot:any) => {
            console.log('Upload completed')
            //this.loader.dismiss;
            console.log(snapshot.Q)
             let  files = [];
            storageRef.getDownloadURL().then((url) => {
              console.log("%%%%%%%%%%%%"+url)
              // this.fire.downloadUrl = url;
              // console.log("My download url "+url)
              this.firebaseUploads.push({name: type, downloadUrl: url});
              //return this.fire.downloadUrl;
            });
            console.log(this.firebaseUploads);
          })
          // return this.userService.saveProfilePicture(blob)
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    })
  }

 
  
}

