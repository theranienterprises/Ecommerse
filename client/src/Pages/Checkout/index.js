import React, { useContext, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { IoBagCheckOutline } from "react-icons/io5";
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
    const [formFields, setFormFields] = useState({
        fullName: "",
        country: "",
        streetAddressLine1: "",
        streetAddressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        phoneNumber: "",
        email: ""
    });

    const [cartData, setCartData] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        const user = JSON.parse(localStorage.getItem("user"));
        fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
            setCartData(res);
            setTotalAmount(res.length !== 0 ?
                res.map(item => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0) : 0);
        });
    }, []);

    const onChangeInput = (e) => {
        setFormFields(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const validateForm = () => {
        const requiredFields = ['fullName', 'country', 'streetAddressLine1', 'city', 'state', 'zipCode', 'phoneNumber', 'email'];
        for (let field of requiredFields) {
            if (formFields[field] === "") {
                context.setAlertBox({
                    open: true,
                    error: true,
                    msg: `Please fill ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                });
                return false;
            }
        }
        return true;
    };

    const checkout = async (e) => {
        e.preventDefault();

    if (!validateForm()) return;

    const user = JSON.parse(localStorage.getItem("user"));

    // Generate a unique transaction ID
    const merchantTransactionId = `${Math.floor(100000000 + Math.random() * 900000000)}`;

    const paymentData = {
        transactionId: merchantTransactionId,
        MUID: user.userId,
        name: formFields.fullName,
        amount: totalAmount,
        number: formFields.phoneNumber
    };

    // Store order details in localStorage
    const pendingOrder = {
        userData: formFields,
        cartData: cartData,
        totalAmount: totalAmount,
        transactionId: merchantTransactionId
    };
    localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/orders/order`, paymentData);
        
        console.log(response);
    
        if (response.data && response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
        } else {
            console.log('No redirect URL provided');
        }
    } catch (error) {
        // Error handling code...
    }
    };

    return (
        <section className='section'>
        <div className='container'>
            <form className='checkoutForm' onSubmit={checkout}>
                <div className='row'>
                    <div className='col-md-8'>
                        <h2 className='hd'>BILLING DETAILS</h2>

                        <div className='row mt-3'>
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <TextField label="Full Name *" variant="outlined" className='w-100' size="small" name="fullName" onChange={onChangeInput} />
                                </div>
                            </div>

                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <TextField label="Country *" variant="outlined" className='w-100' size="small" name="country" onChange={onChangeInput} />
                                </div>
                            </div>


                        </div>


                        <h6>Street address *</h6>

                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='form-group'>
                                    <TextField label="House number and street name" variant="outlined" className='w-100' size="small" name="streetAddressLine1" onChange={onChangeInput} />
                                </div>

                                <div className='form-group'>
                                    <TextField label="Apartment, suite, unit, etc. (optional)" variant="outlined" className='w-100' size="small" name="streetAddressLine2" onChange={onChangeInput} />
                                </div>

                            </div>
                        </div>



                        <h6>Town / City *</h6>

                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='form-group'>
                                    <TextField label="City" variant="outlined" className='w-100' size="small" name="city" onChange={onChangeInput} />
                                </div>

                            </div>
                        </div>

                        <h6>State / County *</h6>

                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='form-group'>
                                    <TextField label="State" variant="outlined" className='w-100' size="small" name="state" onChange={onChangeInput} />
                                </div>

                            </div>
                        </div>


                        <h6>Postcode / ZIP *</h6>

                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='form-group'>
                                    <TextField label="ZIP Code" variant="outlined" className='w-100' size="small" name="zipCode" onChange={onChangeInput} />
                                </div>

                            </div>
                        </div>


                        <div className='row'>
                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <TextField label="Phone Number" variant="outlined" className='w-100' size="small" name="phoneNumber" onChange={onChangeInput} />
                                </div>
                            </div>

                            <div className='col-md-6'>
                                <div className='form-group'>
                                    <TextField label="Email Address" variant="outlined" className='w-100' size="small" name="email" onChange={onChangeInput} />
                                </div>
                            </div>

                        </div>


                    </div>

                    <div className='col-md-4'>
                        <div className='card orderInfo'>
                            <h4 className='hd'>YOUR ORDER</h4>
                            <div className='table-responsive mt-3'>
                                <table className='table table-borderless'>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            cartData?.length !== 0 && cartData?.map((item, index) => {
                                                return (
                                                    <tr>
                                                        <td>{item?.productTitle?.substr(0, 20) + '...'}  <b>× {item?.quantity}</b></td>

                                                        <td> 
                                                        
                                                        {
                                                            item?.subTotal?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })
                                                        }
                                                        
                                                     </td>
                                                    </tr>

                                                )
                                            })
                                        }



                                        <tr>
                                            <td>Subtotal </td>

                                            <td>

                                            {
                                                (cartData?.length !== 0 ?
                                                    cartData?.map(item => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0) : 0)?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })
                                            }

                                              
                                            </td>
                                        </tr>


                                    </tbody>
                                </table>
                            </div>

                            <Button type="submit" className='btn-blue bg-red btn-lg btn-big'
                            ><IoBagCheckOutline /> &nbsp; Checkout</Button>

                        </div>
                    </div>


                </div>
            </form>
        </div>
    </section>
    );
};

export default Checkout;