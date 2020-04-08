import React, { Component } from 'react';
import Joke from './Joke';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './JokesList.css';

class JokesList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    }

    constructor(props) {
        super(props);

        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
        }

        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        if(this.state.jokes.length === 0) this.getJokes();
    }

    async getJokes() {
        try {
            let jokes = [];
            while(jokes.length < this.props.numJokesToGet) {
                let res = await axios.get("https://icanhazdadjoke.com/", {headers: { Accept: "application/json" }});
                let newJoke = res.data.joke;
                if(!this.seenJokes.has(newJoke)) {
                    jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
                    this.seenJokes.add(newJoke);
                }
            }
            this.setState(st => ({ jokes: [...st.jokes, ...jokes], loading: false }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
        } catch(err) {
            alert(err);
            this.setState({ loading: false });
        } 
    }

    handleClick() {
        this.setState({ loading: true }, () => this.getJokes());
    }

    handleVote(id, delta) {
        this.setState(st => ({ jokes: st.jokes.map(j => j.id === id ? {...j, votes: j.votes + delta} : j) }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
    }

    render() {
        if(this.state.loading || !this.state.jokes.length) {
            return(
                <div className="JokesList-spinner">
                    <i className="far fa-laugh fa-8x fa-spin"></i>
                    <h1 className="JokesList-loading">Loading...</h1>
                </div>
            )
        }
        return (
            <div className="JokesList">
                <div className="JokesList-sidebar">
                    <h1 className="JokesList-title"><span>Dad</span> Jokes</h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="logo" />
                    <button className="JokesList-getmore" onClick={this.handleClick}>New Jokes</button>
                </div>
                <div className="JokesList-jokes">
                    {this.state.jokes.map(j => (
                        <Joke key={j.id} votes={j.votes} text={j.text} upvote={() => this.handleVote(j.id, 1)} downvote={() => this.handleVote(j.id, -1)}/>
                    ))}
                </div>
            </div>
        )
    }
}

export default JokesList;