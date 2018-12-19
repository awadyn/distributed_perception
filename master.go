package main

import "fmt"
import "log"
import "net/http"
import "html/template"
//import "time"
import "sync"

type Stage struct {
	mu		sync.Mutex
	Dancers		map[uint64]*Dancer
	//Solos		map[uint64]*AudibleSpec
}

type Dancer struct {
	Id		uint64
	//TimeoutTimer	*time.Timer
	//Solo		AudibleSpec
	//syncCh	chan int
	//listenCh	chan []Beat
}

//type Beat struct {
//	Value		int
//	Length		int64
//}

//type AudibleSpec struct {
//	Start		uint64
//	End		uint64
//}


var Id uint64
var stage *Stage


func Dance(w http.ResponseWriter, r *http.Request) {

	id := Id
	NewDancer := Dancer { Id: id }
	stage.Dancers[id] = &NewDancer

	Id ++

	fmt.Printf("Dancer %v joined stage, new stage: %+v\n", id, stage)

	t, err := template.ParseFiles("html/dance.html")
	if err != nil {
		log.Print("template parsing error: ", err)
	}
	err = t.Execute(w, NewDancer)
	if err != nil {
		log.Print("template executing error: ", err) //log it
	}
}


func main() {
	Id = 0
	stage = new(Stage)
	stage.Dancers = make(map[uint64]*Dancer)
	//stage.Solos = make(map[uint64]*AudibleSpec)

	http.HandleFunc("/dance", Dance)
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("js"))))

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}



