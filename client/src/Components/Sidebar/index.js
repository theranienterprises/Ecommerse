import React, { useEffect, useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { Link, useParams } from 'react-router-dom';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Rating from '@mui/material/Rating';
import { fetchDataFromApi } from "../../utils/api"; // Adjust import as necessary

const Sidebar = (props) => {
    const [value, setValue] = useState([100, 180000]);
    const [filterSubCat, setFilterSubCat] = useState();
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [subCategoryData, setSubCategoryData] = useState([]);
    const [subCatId, setSubCatId] = useState('');

    const { id } = useParams(); // Get the parent category ID from URL parameters

    useEffect(() => {
        setSubCatId(id); // Set the sub-category ID from the URL parameter
    }, [id]);

    useEffect(() => {
        setIsOpenFilter(props.isOpenFilter); // Update the open filter state from props
    }, [props.isOpenFilter]);

    // Fetch data from the updated API route
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/category/temp/${id}`); // Use the updated API route
                const data = await response.json();
                console.log(data);

                if (data && data.success && data.categoryList) {
                    setSubCategoryData(data.categoryList); // Directly set the categories data
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchCategories();
    }, [id]); // Re-run the effect when `id` changes

    const handleChange = (event) => {
        setFilterSubCat(event.target.value);
        props.filterData(event.target.value);
        setSubCatId(event.target.value);
    };

    useEffect(() => {
        props.filterByPrice(value, subCatId); // Update filter by price whenever value or subCatId changes
    }, [value, subCatId]);

    const filterByRating = (rating) => {
        props.filterByRating(rating, subCatId); // Filter by rating
    };

    return (
        <>
            <div className={`sidebar ${isOpenFilter === true ? 'open' : ''}`}>
                <div className="filterBox">
                    <h6>PRODUCT CATEGORIES</h6>
                    <div className='scroll'>
                        <RadioGroup
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            value={filterSubCat}
                            onChange={handleChange}
                        >
                            {subCategoryData.length > 0 && subCategoryData.map((item) => (
                                <FormControlLabel
                                    key={item._id} // Use _id from your data
                                    value={item._id}
                                    control={<Radio />}
                                    label={item.name}
                                />
                            ))}
                        </RadioGroup>
                    </div>
                </div>

                <div className="filterBox">
                    <h6>FILTER BY PRICE</h6>
                    <RangeSlider value={value} onInput={setValue} min={100} max={180000} step={5} />
                    <div className='d-flex pt-2 pb-2 priceRange'>
                        <span>From: <strong className='text-dark'>Rs: {value[0]}</strong></span>
                        <span className='ml-auto'>To: <strong className='text-dark'>Rs: {value[1]}</strong></span>
                    </div>
                </div>

                <div className="filterBox">
                    <h6>FILTER BY RATING</h6>
                    <div className='scroll pl-0'>
                        <ul>
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <li key={rating} onClick={() => filterByRating(rating)} className='cursor'>
                                    <Rating name="read-only" value={rating} readOnly size="small" />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <br />

                <Link to="#"><img src='../../assets/images/innerbanner.jpeg' className='w-100' alt="Banner" /></Link>
            </div>
        </>
    );
};

export default Sidebar;
