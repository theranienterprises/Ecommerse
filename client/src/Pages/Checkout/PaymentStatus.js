import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentStatus = () => {
    const [status, setStatus] = useState('Checking payment status...');
    const navigate = useNavigate();

    useEffect(() => {
        insertOrder();
    }, []);

    const insertOrder = async () => {
        const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
        if (!pendingOrder) {
            setStatus('No pending order found');
            return;
        }

        const orderData = {
            name: pendingOrder.userData.fullName,
            phoneNumber: pendingOrder.userData.phoneNumber,
            address: `${pendingOrder.userData.streetAddressLine1}, ${pendingOrder.userData.streetAddressLine2}, ${pendingOrder.userData.city}, ${pendingOrder.userData.state}`,
            pincode: pendingOrder.userData.zipCode,
            amount: pendingOrder.totalAmount,
            paymentId: pendingOrder.transactionId,
            email: pendingOrder.userData.email,
            userid: JSON.parse(localStorage.getItem("user")).userId,
            products: pendingOrder.cartData
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/orders/create`, orderData);
            if (response.data.success) {
                localStorage.removeItem('pendingOrder');
                
                await clearCart(orderData.userid);

                setStatus('Order placed successfully Click show orders to get details');
                // setTimeout(() => {
                //     window.location.reload();
                // }, 3000);

                
            } else {
                setStatus('Error creating order');
            }
        } catch (error) {
            console.error('Error inserting order:', error);
            setStatus('Error creating order');
        }
    };

    const clearCart = async (userId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/cart/clear/${userId}`);
            console.log('Cart cleared successfully');
            
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    return (
        <div>
            <h2>Payment Status</h2>
            <p>{status}</p>
            <a href="#/orders">Show Orders</a>
        </div>
    );
};

export default PaymentStatus;
