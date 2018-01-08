import React, { Component } from 'react';
import axios from 'axios';

import './style.css'

const API_URL = 'https://api.myjson.com/bins/w9p1t';
const NO_NETWORK_MSG = 'Please check your internet connection';

export default class ProductTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      'products' : null,
      'total': 0
    }


    // binding methods so they can access this as a current instance of the class.
    this.getTableData = this.getTableData.bind(this);
    this.renderTableRows = this.renderTableRows.bind(this);
    this.updateData = this.updateData.bind(this);
    this.onChange = this.onChange.bind(this);
    this.resetData = this.resetData.bind(this);
  }

  componentDidMount() {
    this.getTableData(API_URL,this.updateData);
  }


  // Promise which returns product Data from API.
  getTableData(url,callback) {
    axios.get(url)
    .then( response => response)
    .then( data => {
      this.setState({ 
        'products': data.data 
      }, callback(data.data))
      }
     )
    .catch( error => {
      if(error.data) {
        return error.data;
      } else {
      	console.log(NO_NETWORK_MSG);
        return NO_NETWORK_MSG;
      }
    })
  }

  // Modifies the data which comes from API for updating the view.
  updateData(data) {
    let total = 0;
    let updatedProducts = data.map( (product,pos) => {
      product.id = pos;
      product.totalAmount = product.price * product.quantity;
      if(product.isChecked) {
        total += product.totalAmount;
      }
      return product;
    })
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    localStorage.setItem('total',total);
    this.setState({ 
      products : updatedProducts,
      total 
    });
    
  }

  // reset function for reseting the table values.
  resetData(){
    this.setState({products : JSON.parse(localStorage.getItem('products')) });
    this.setState({total: localStorage.getItem('total')});
  }

  // function for rendering table rows.
  renderTableRows() {
    let {
      products
    } = this.state;
    return products.map(product => {
      return(
        <tr className={ product.isChecked ? '': 'disabled'} key={product.id}>
          <td> <input type="checkbox" checked={product.isChecked} onChange={e => this.onChange(product.id, e.target)} /> </td>
          <td> { product.productName} </td>
          <td className="quantity"> < input type="number" disabled={!product.isChecked} value={ this.state.quantity || product.quantity } onChange={e => this.onChange(product.id, e.target) } min="0" max="100" /> </td>
          <td> &#8377; { product.totalAmount } </td>
        </tr>
      )
    })
  }

  // common function for onChange events of checkbox and quantity field.
  onChange(id, target) {
    let {
      products
    } = this.state,
    total = 0,
    {
      type,
      value
    } = target;

    products = products.map(product=>{
      if(product.id === parseInt(id,10)) {
        switch(type) {
          case 'checkbox':
            product.isChecked = !product.isChecked;
            break;
          case 'number':
            product.quantity = parseInt(value,10);
            product.totalAmount = parseInt(value,10) * product.price;
            break;
          default:
            return product;

        } 
      }
      if(product.isChecked) {
       total += product.totalAmount
      }
      return product;
    })
    this.setState({ 
      products,
      total 
    });
  }

  componentWillUnmount() {
  	localStorage.removeItem('products');
  	localStorage.removeItem('total')
  }

  render() { 
    return (
    		<div>
        <table>
          <tbody>
          <tr>
            <th> </th>
            <th> Product Name </th>
            <th> Quantity </th> 
            <th> Price </th>
          </tr>
          { this.state.products && this.renderTableRows() }
          </tbody>
        </table>
        <div className='reset-total-wrapper'>
          <div className="reset-wrapper">
            <button onClick={ e=> this.resetData() }> reset </button>
          </div>
          <span>
          <span>total </span> <span className="amount" >&#8377; {this.state.total } </span>
          </span>
        </div>
      </div>
    );
  }
}