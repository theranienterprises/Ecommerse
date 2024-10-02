import HomeBanner from "../../Components/HomeBanner";
import banner1 from "../../assets/images/banner1.avif";
import banner2 from "../../assets/images/banner2.jpeg";
import Button from "@mui/material/Button";
import { IoIosArrowRoundForward } from "react-icons/io";
import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import ProductItem from "../../Components/ProductItem";
import HomeCat from "../../Components/HomeCat";
import axios from 'axios';

import offer from "../../assets/images/offer.jpeg";
import banner4 from "../../assets/images/banner4.jpg";

import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCat, setselectedCat] = useState();
  const [filterData, setFilterData] = useState([]);
  const [homeSlides, setHomeSlides] = useState([]);
  const [bannerImages, setBannerImages] = useState({ image1: '', image2: '' });
  const [offerImages, setOfferImages] = useState({ image1: '', image2: '', image3: '' });

  const [value, setValue] = React.useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(MyContext);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const selectCat = (cat) => {
    setselectedCat(cat);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    setselectedCat(context.categoryData[0]?.name);

    const location = localStorage.getItem("location");

    if (location !== null && location !== "" && location !== undefined) {
      fetchDataFromApi(`/api/products/featured?location=${location}`).then(
        (res) => {
          setFeaturedProducts(res);
        }
      );

      fetchDataFromApi(
        `/api/products?page=1&perPage=8&location=${location}`
      ).then((res) => {
        setProductsData(res);
      });
    }

    fetchDataFromApi("/api/homeBanner").then((res) => {
      setHomeSlides(res);
    });
  }, []);

  useEffect(() => {
    if (context.categoryData[0] !== undefined)
      setselectedCat(context.categoryData[0].name);
  }, [context.categoryData]);

  useEffect(() => {
    if (selectedCat !== undefined) {
      setIsLoading(true);
      const location = localStorage.getItem("location");
      fetchDataFromApi(
        `/api/products?catName=${selectedCat}&location=${location}`
      ).then((res) => {
        setFilterData(res.products);
        setIsLoading(false);
        // console.log(selectedCat)
      });
    }
  }, [selectedCat]);

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromApi(`/api/homeBanner/fetchveroffer`)
      .then((res) => {
        if (res && res.image1 && res.image2) {
          setBannerImages(res);
        } else {
          console.error('Unexpected response format:', res);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching banner images:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchOfferImages = () => {
      setIsLoading(true);
      fetchDataFromApi('/api/homeBanner/offerfetch')
        .then((res) => {
          setOfferImages(res);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching offer images:', error);
          setIsLoading(false);
        });
    };

    fetchOfferImages();
  }, []);

  return (
    <>
      {homeSlides?.length !== 0 && <HomeBanner data={homeSlides} />}

      {context.categoryData?.length !== 0 && (
        <HomeCat catData={context.categoryData} />
      )}

      <section className="homeProducts">
        <div className="container">
          <div className="row homeProductsRow">
            <div className="col-md-3">
              <div className="sticky">
              <div className="banner">
                <img src={bannerImages.image1} className="cursor w-100" alt="Banner 1" />
              </div>
              <div className="banner mt-4">
                <img src={bannerImages.image2} className="cursor w-100" alt="Banner 2" />
              </div>
              </div>
            </div>

            <div className="col-md-9 productRow">

            <div className="d-flex align-items-center mt-4">
                <div className="info w-75">
                  <h3 className="mb-0 hd">NEW PRODUCTS</h3>
                  <p className="text-light text-sml mb-0">
                    New products with updated stocks.
                  </p>
                </div>
              </div>

              <div className="product_row productRow2 w-100 mt-4 d-flex productScroller">
                {productsData?.products?.length !== 0 &&
                  productsData?.products
                    ?.slice(0)
                    .reverse()
                    .map((item, index) => {
                      return <ProductItem key={index} item={item} />;
                    })}
              </div>

              <div className="d-flex mt-4 mb-3 bannerSec">
              {Object.values(offerImages)
                .slice(1, 4)
                .map((image, index) => (
                  <div
                    className="banner"
                    key={index}
                    style={{
                      border: '2px solid black',
                      boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <img
                      src={image}
                      className="cursor w-100"
                      alt={`Offer ${index + 1}`}
                      onLoad={(e) => {
                        setTimeout(() => {
                          e.target.src = e.target.src.split("?")[0] + "?" + new Date().getTime();
                        }, 6000); // 5 seconds delay
                      }}
                    />


                  </div>

                ))}
            </div>

              <br/>
              <div className="d-flex align-items-center res-flex-column">
                <div className="info" style={{ width: "35%" }}>
                  <h3 className="mb-0 hd">Popular Products</h3>
                  <p className="text-light text-sml mb-0">
                    Do not miss the current offers.
                  </p>
                </div>

                <div
                  className="ml-auto d-flex align-items-center justify-content-end res-full"
                  style={{ width: "50%" }}
                >
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    className="filterTabs"
                  >
                    {context.categoryData?.map((item, index) => {
                      return (
                        <Tab
                          className="item"
                          label={item.name}
                          onClick={() => selectCat(item.name)}
                        />
                      );
                    })}
                  </Tabs>
                </div>
              </div>

              <div
                className="product_row w-100 mt-2"
                style={{ opacity: `${isLoading === true ? "0.5" : "1"}` }}
              >
                {context.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={4}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {filterData?.length !== 0 &&
                      filterData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return (
                            <SwiperSlide key={index}>
                              <ProductItem item={item} />
                            </SwiperSlide>
                          );
                        })}
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {filterData?.length !== 0 &&
                      filterData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return (
                              <ProductItem item={item} key={index} />
                          );
                        })}
                  </div>
                )}
              </div>

             


              

              <div className="d-flex align-items-center mt-4">
                <div className="info">
                  <h3 className="mb-0 hd">Bajaj products</h3>
                  
                </div>
              </div>

              <div className="product_row w-100 mt-2">
              {
                context.windowWidth>992 ?
                <Swiper
                slidesPerView={4}
                spaceBetween={0}
                navigation={true}
                slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                modules={[Navigation]}
                className="mySwiper"
                breakpoints={{
                  300: {
                    slidesPerView: 1,
                    spaceBetween: 5,
                  },
                  400: {
                    slidesPerView: 2,
                    spaceBetween: 5,
                  },
                  600: {
                    slidesPerView: 3,
                    spaceBetween: 5,
                  },
                  750: {
                    slidesPerView: 4,
                    spaceBetween: 5,
                  },
                }}
              >
                {featuredProducts?.length !== 0 &&
                  featuredProducts
                    ?.slice(0)
                    ?.reverse()
                    ?.map((item, index) => {
                      return (
                        <SwiperSlide key={index}>
                          <ProductItem item={item} />
                        </SwiperSlide>
                      );
                    })}
              </Swiper>


              :

              <div className="productScroller">
               {featuredProducts?.length !== 0 &&
                  featuredProducts
                    ?.slice(0)
                    ?.reverse()
                    ?.map((item, index) => {
                      return (
                          <ProductItem item={item} key={index} />
                      );
                    })}
              </div>
              }
               
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
