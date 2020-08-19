import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Mensaje } from '../interface/mensaje.interface';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private itemsCollection: AngularFirestoreCollection<Mensaje>;
  public chats: Mensaje[] = [];
  public usuario: any = {};

  constructor( private afs: AngularFirestore,
               public afAuth: AngularFireAuth ) {

    this.afAuth.authState.subscribe( user => {
      console.log( 'Estado del usuario: ', user );
      if ( !user ) {
        return;
      }
      this.usuario.nombre = user.displayName;
      if ( user.displayName === null) {
        this.usuario.nombre = 'NN';
      }
      this.usuario.uid = user.uid;
      this.usuario.color = this.color();
    });
  }

  login( proveedor: string ) {
    if ( proveedor === 'google') {
      this.afAuth.signInWithPopup(new auth.GoogleAuthProvider());
    } else if ( proveedor === 'github') {
      this.afAuth.signInWithPopup(new auth.GithubAuthProvider());
    // } else if ( proveedor === 'twitter') { // Hay que crearse una cuenta
    //   this.afAuth.signInWithPopup(new auth.TwitterAuthProvider());
    } else if ( proveedor === 'facebook') {
      this.afAuth.signInWithPopup(new auth.FacebookAuthProvider());
    } else if ( proveedor === 'yahoo') {
      this.afAuth.signInWithPopup(new auth.OAuthProvider('yahoo.com'));
    }
  }

  logout() {
    this.usuario = {};
    this.afAuth.signOut();
  }

  cargarMensajes() {
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha', 'desc')
                                                                            .limit(5));
    return this.itemsCollection.valueChanges().pipe(
                    map( (mensajes: Mensaje[]) => {
                      console.log(mensajes);
                      this.chats = [];
                      for ( let mensaje of mensajes ) {
                        this.chats.unshift( mensaje );
                      }
                      return this.chats;
                    })
    );
  }

  agregarMensaje( texto: string ) {
    const mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid,
      color: this.usuario.color
    };

    return this.itemsCollection.add( mensaje );
  }

  color(){
    const hexadecimal = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
    let color_aleatorio = '#';
    for ( let i = 0; i < 6; i++){
       const posarray = this.aleatorio( 0, hexadecimal.length );
       color_aleatorio += hexadecimal[posarray];
    }
    return color_aleatorio;
 }

  aleatorio( inferior, superior ){
    const numPosibilidades = superior - inferior;
    let aleat = Math.random() * numPosibilidades;
    aleat = Math.floor(aleat);
    // tslint:disable-next-line: radix
    return parseInt( inferior ) + aleat;
  }

}
