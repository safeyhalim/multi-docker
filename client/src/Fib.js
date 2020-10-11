import React, { Component } from 'react';
import axios from 'axios'; // to make requests to the backend server

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {}, // empty object
        index: ''
    };

    // lifecycle method that gets called immediately after the component is mounted. Afterwards, rendering is triggered.
    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({
            seenIndexes: seenIndexes.data
        });
    }

    
    handleSubmit = async (event) => { // bound function
        event.preventDefault(); // Prevents the form from submitting itself (looks like this is a default behaviour)
        await axios.post('/api/values', {
            index: this.state.index
        });
        this.setState({index: ''}); // emptying the state index after sumbitting the entered index
    }

    renderSeenIndexes() {
        return this.state.seenIndexes.map( ({number}) => number).join(', '); // This will iterate over the array of indexes which is an array of objects and return the number property from it. The join statement will put a comma between the array of returned numbers.
    }

    renderValues() {
        const entries = [];
        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    render() {
        return(
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input 
                      value={this.state.index}
                      onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated Values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;