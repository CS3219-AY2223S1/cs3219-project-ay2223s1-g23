import React from "react";
import axios from "axios";
import { URL_INSERT_DIFFICULTY } from "../configs";
import { STATUS_CODE_CREATED } from "../constants";
import { v4 as uuidv4 } from "uuid";

class DifficultySelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDifficulty: "easy",
      userId: uuidv4() // random uuid
    };
  }

  handleOptionChange = (event) => {
    this.setState({
      selectedDifficulty: event.target.value
    });
  };

  handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log("Your userId: ", this.state.userId);
    console.log("You have selected: ", this.state.selectedDifficulty);

    const res = await axios
      .post(URL_INSERT_DIFFICULTY, {
        userId: this.state.userId,
        difficulty: this.state.selectedDifficulty
      })
      .catch(() => {
        console.log("Please try again later");
      });
    if (res && res.status === STATUS_CODE_CREATED) {
      console.log("Difficulty successfully inserted");
    }
  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <form onSubmit={this.handleFormSubmit}>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="easy"
                    checked={this.state.selectedDifficulty === "easy"}
                    onChange={this.handleOptionChange}
                  />
                  Easy
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="medium"
                    checked={this.state.selectedDifficulty === "medium"}
                    onChange={this.handleOptionChange}
                  />
                  Medium
                </label>
              </div>
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value="hard"
                    checked={this.state.selectedDifficulty === "hard"}
                    onChange={this.handleOptionChange}
                  />
                  Hard
                </label>
              </div>
              <button className="btn btn-default" type="submit">
                Match
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default DifficultySelection;
