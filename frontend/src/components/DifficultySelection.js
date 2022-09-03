import React from 'react';

export default class DifficultySelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedDifficulty: 'easy' };
    }

    handleOptionChange = (event) => {
        this.setState({
            selectedDifficulty: event.target.value
        })
    }

    handleFormSubmit = (event) => {
        event.preventDefault();
        console.log("You have selected: ", this.state.selectedDifficulty);
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-12">
                        <form onSubmit={this.handleFormSubmit}>
                            <div className="radio">
                                <label>
                                    <input type="radio" value="easy"
                                        checked={this.state.selectedDifficulty === 'easy'}
                                        onChange={this.handleOptionChange} />
                                    Easy
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    <input type="radio" value="medium"
                                        checked={this.state.selectedDifficulty === 'medium'}
                                        onChange={this.handleOptionChange} />
                                    Medium
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    <input type="radio" value="hard"
                                        checked={this.state.selectedDifficulty === 'hard'}
                                        onChange={this.handleOptionChange} />
                                    Hard
                                </label>
                            </div>
                            <button className="btn btn-default" type="submit">Match</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
};
