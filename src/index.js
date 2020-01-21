import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Exercise(props) {
  const options = props.tags.map((tag) => 
    <option key={tag} value={tag}>{(tag.charAt(0).toUpperCase() + tag.substring(1)).replace("_", " ")}</option>
  );

  return (
    <span className="exercise">
      <select value={props.value} onChange={(e) => props.onChange(e,props.id)}>
        <option value="none">None</option>
        {options}
      </select>
      <button className="deleteSlot" onClick={() => props.onDelete(props.id)}>X</button>
    </span>
  );
}

class ExerciseForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      values: [],
      exercises: [],
      plan: "",
      tags: [],
      planGenerated: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.addExercise = this.addExercise.bind(this);
    this.deleteSlot = this.deleteSlot.bind(this);
    this.generatePlan = this.generatePlan.bind(this);
    this.clearAll = this.clearAll.bind(this);
  }

  componentDidMount() {
    // Get list of current tags from back-end database
    fetch('http://localhost:8080/tags')
    .then((response) => response.json())
    .then((response) => {
      console.log('Success:', response.data);

      this.setState({
        tags: response.data,
      })
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  handleChange(event, id) {
    const values = this.state.values.slice();
    values[id] = event.target.value;
    this.setState({
      values : values,
    });

    const data = { 
      tag : event.target.value,
      exercises: this.state.exercises.slice(),
    };

    console.log(data);

    fetch('http://localhost:8080/getexercisebytag', 
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(data),
      })
      .then((response) => response.json())
      .then((response) => {
        console.log('Success:', response.data);

        const exercises = this.state.exercises.slice();
        exercises[id] = response.data;

        this.setState({
          exercises: exercises,
        })

        console.log(this.state.values);
        console.log(this.state.exercises);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  deleteSlot(id) {
    const values = this.state.values.slice();
    const exercises = this.state.exercises.slice();

    values.splice(id, 1);
    exercises.splice(id, 1);

    this.setState({
      values: values,
      exercises: exercises,
    });
  }

  addExercise() {
    const values = this.state.values.slice();

    this.setState({
      values: values.concat(['']),
    });
  }

  clearAll() {
    this.setState ({
      values: [],
      exercises: [],
      planGenerated: false,
      plan: "",
    });
  }

  generatePlan() {
    const exercises = this.state.exercises.map((data, i) => 
      <tr key={data.name}>
        <td>{this.state.values[i]}</td>
        <td>{data.name}</td>
        <td>{(data.equipment.charAt(0).toUpperCase() 
            + data.equipment.substring(1))
            .replace("_", " ").replace(",", ", ")}</td>
      </tr>
    );

    this.setState ({
      plan: exercises,
      planGenerated: true,
    })
  }

  render() {
    const values = this.state.values.slice();
    const indexes = [...Array(values.length).keys()];
    const exercisesList = indexes.map((i) =>
      <li key={i}>
        <Exercise 
          id={i}
          value={values[i]}
          onChange={this.handleChange}
          onDelete={this.deleteSlot}
          tags={this.state.tags}
        />
      </li>
    );

    var headers = "";

    if (this.state.planGenerated) {
      headers = (
        <tr>
          <th>Tag</th>
          <th>Exercise</th>
          <th>Equipment</th>
        </tr>
      );
    }

    return (
      <div>
        <ul id="exerciseForm">
          {exercisesList}
        </ul>
        <div id="table">
            <button id="addExercise" onClick={this.addExercise}>Add Exercise Slot</button>
            <button id="clear" onClick={this.clearAll}>Clear All</button>
          <div>
            <button id="generatePlan" onClick={this.generatePlan}>Create Plan</button>
          </div>
          <table id="plan">
            {headers}
            {this.state.plan}
          </table>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return(
      <div>
        <h1>Randomized Exercise Plan Generator</h1>
        <ExerciseForm />
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);