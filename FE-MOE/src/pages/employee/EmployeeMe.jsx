import React, { useState, useEffect } from "react";
import { Breadcrumbs, Button, FormControl, FormLabel, Input, Link, Option, Radio, RadioGroup, Select } from '@mui/joy';
import HomeIcon from "@mui/icons-material/Home";
import { Container, Box, Grid, Typography, Paper, Avatar } from '@mui/material';
import { getEmployeeDetail, updateEmployeeDetail, postEmployeeImage, getAllPositions } from "~/apis/employeeApi";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from 'react-toastify';

const host = "https://provinces.open-api.vn/api/";

export const EmployeeMe = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageObject, setImageObject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [position, setPosition] = useState(null);
  /*---Start handle address---*/

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");


  const [employeeData, setEmployeeData] = useState({
    last_name: '',
    first_name: '',
    email: '',
    phone_number: '',
    salary: '',
    position: '',
    gender: '',
    date_of_birth: '',
    city: '',
    district: '',
    ward: '',
    streetName: '',
  });
  useEffect(() => {
    const fetchPosition = async () => {
      await getAllPositions().then((res) => setPositions(res.data))
    }
    fetchPosition();
  }, [])

  useEffect(() => {
    const fetchCities = async () => {
      const response = await axios.get(`${host}?depth=1`);
      setCities(response.data);
    };
    fetchCities();
  }, []);

  const handleCityChange = async (e) => {
    const cityId = e;
    setSelectedCity(cityId);
    setSelectedDistrict("");
    setSelectedWard("");
    if (cityId) {
      const response = await axios.get(`${host}p/${cityId}?depth=2`);
      setDistricts(response.data.districts);
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e;
    setSelectedDistrict(districtId);
    setSelectedWard(""); // Reset ward
    if (districtId) {
      const response = await axios.get(`${host}d/${districtId}?depth=2`);
      setWards(response.data.wards);
    } else {
      setWards([]);
    }
  };

  const handleWardChange = (e) => {
    setSelectedWard(e);
  };

  const formatDate = (dateString, time = "00:00:00") => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} | ${time}`;
  };

  const formatDate2 = (dateTimeString) => {
    const [datePart] = dateTimeString.split(' | ');
    const [day, month, year] = datePart.split('/');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID không hợp lệ");
      return;
    }
    const fetchEmployeeDetail = async () => {
      try {
        const employeeData = await getEmployeeDetail(userId);
        if (!employeeData || typeof employeeData !== "object") {
          throw new Error("Dữ liệu trả về không hợp lệ");
        }
        if (employeeData?.employee_address) {
          await handleCityChange(employeeData.employee_address.cityId);
          await handleDistrictChange(employeeData.employee_address.districtId);
        }
        setEmployeeData({
          first_name: employeeData.first_name || "",
          last_name: employeeData.last_name || "",
          phone_number: employeeData.phone_number || "",
          gender: employeeData.gender === "Nam" ? "MALE" : employeeData.gender === "Nữ" ? "FEMALE" : "OTHER",
          date_of_birth: formatDate2(employeeData.date_of_birth),
          salary: employeeData.salaries || "",
          position: employeeData.position?.id || "",
          avatar: employeeData.avatar || "",
          email: employeeData.email || "",
          city: employeeData.employee_address?.city || "",
          district: employeeData.employee_address?.district || "",
          ward: employeeData.employee_address?.ward || "",
          streetName: employeeData.employee_address?.streetName || "",
        });
        setSelectedCity(employeeData.employee_address?.cityId || "");
        setSelectedDistrict(employeeData.employee_address?.districtId || "");
        setSelectedWard(employeeData.employee_address?.ward || "");
        setImagePreview(employeeData.avatar || "");
      } catch (error) {
        console.error("Error fetching employee details:", error);
        toast.error(
          "Error fetching employee details: " +
          (error.response?.data?.message || error.message)
        );
      }
    };

    fetchEmployeeDetail();
  }, []);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setEmployeeData((prev) => ({ ...prev, [name]: value }));
  // };

  const [errors, setErrors] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
    avatar: '',
    salary: '', // thêm salary nếu cần
  });

  const validateInputs = () => {
    let tempErrors = {};
    if (!employeeData.email) tempErrors.email = "Email là bắt buộc.";
    if (!employeeData.first_name) tempErrors.first_name = "Tên là bắt buộc.";
    if (!employeeData.last_name) tempErrors.last_name = "Họ là bắt buộc.";
    if (!employeeData.gender) tempErrors.gender = "Phải chọn giới tính.";
    if (!employeeData.phone_number) tempErrors.phone_number = "Số điện thoại là bắt buộc.";
    if (!employeeData.date_of_birth) tempErrors.date_of_birth = "Ngày sinh là bắt buộc.";
    if (!employeeData.salary) tempErrors.salary = "Lương là bắt buộc.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };
    const specialCharRegex = /[!@#$%^&*(),.?":\\||{}|<>0-9]/g;
    const phoneRegex = /^0\d{9,11}$/;
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const minAge = 16;

    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    switch (name) {
      case 'last_name':
        if (value.length > 20) {
          newErrors.last_name = "Họ không được vượt quá 20 ký tự";
        } else if (specialCharRegex.test(value)) {
          newErrors.last_name = "Họ không được chứa ký tự đặc biệt và số";
        } else {
          delete newErrors.last_name;
        }
        break;

      case 'first_name':
        if (value.length > 50) {
          newErrors.first_name = "Tên không được vượt quá 50 ký tự";
        } else if (specialCharRegex.test(value)) {
          newErrors.first_name = "Tên không được chứa ký tự đặc biệt và số";
        } else {
          delete newErrors.first_name;
        }
        break;

      case 'phone_number':
        if (!phoneRegex.test(value)) {
          newErrors.phone_number = "Số điện thoại phải bắt đầu bằng 0 và có từ 10-12 chữ số, không chứa ký tự đặc biệt";
        } else {
          delete newErrors.phone_number;
        }
        break;

      case 'gender':
        if (!value) {
          newErrors.gender = "Phải chọn giới tính";
        } else {
          delete newErrors.gender;
        }
        break;

      case 'date_of_birth':
        const age = calculateAge(value);
        if (age < minAge) {
          newErrors.date_of_birth = "Phải trên 16 tuổi";
        } else {
          delete newErrors.date_of_birth;
        }
        break;

      case 'username':
        if (!usernameRegex.test(value)) {
          newErrors.username = "Tên tài khoản phải từ 3 đến 20 ký tự và không chứa ký tự đặc biệt";
        } else {
          delete newErrors.username;
        }
        break;

      case 'email':
        if (!emailRegex.test(value)) {
          newErrors.email = "Email không đúng định dạng";
        } else {
          delete newErrors.email;
        }
        break;

      case 'salary':
        if (parseInt(value) <= 1000) {
          newErrors.salary = "Lương phải lớn hơn 1000";
        } else {
          delete newErrors.salary;
        }
        break;
      default:
        break;
    }

    // Cập nhật employeeData và errors
    setEmployeeData((prevData) => ({ ...prevData, [name]: value }));
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
    const cityName = cities.find((city) => city.code == selectedCity)?.name;
    const districtName = districts.find((district) => district.code == selectedDistrict)?.name;
    const wardName = wards.find((ward) => ward.name == selectedWard)?.name;
    const updatedEmploye = {
      ...employeeData,
      city: cityName,
      city_id: selectedCity,
      district: districtName,
      district_id: selectedDistrict,
      ward: wardName,
      position: employeeData.position,
      date_of_birth: formatDate(employeeData.date_of_birth),
    };
    console.log("Dữ liệu cập nhật nhân viên:", updatedEmploye);
    setIsLoading(true);
    const userId = localStorage.getItem('userId');
    await updateEmployeeDetail(updatedEmploye, userId).then(async (res) => {
      if (imageObject === null) {
        setIsLoading(false);
        // navigate('/employee');
        return;
      }

      const formData = new FormData();
      formData.append("images", imageObject);
      formData.append("productId", userId);
      await postEmployeeImage(formData).then(() => {
        setIsLoading(false);
        // navigate('/employee');
      });
    });
  };


  const handleImageChange = (event) => {
    var file = event.target.files[0];
    var url = URL.createObjectURL(file)
    setImagePreview(url)
    setImageObject(file)
  }


  return (
    <Container maxWidth="max-width" sx={{ height: "100vh", marginTop: "15px" }}>
      <Box mt={4} mb={4}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          marginBottom={2}
          height={"50px"}
        >
          <Breadcrumbs aria-label="breadcrumb" sx={{ marginLeft: "5px" }}>
            <Link disabled={isLoading}
              underline="hover"
              sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              color="inherit"
              onClick={() => navigate("/")}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Trang chủ
            </Link>
            <Typography sx={{ color: "text.white", cursor: "pointer" }}>
              Thông tin tài khoản
            </Typography>
          </Breadcrumbs>
        </Grid>
        <Paper elevation={3}>
          <Box p={4}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar
                      src={imagePreview || '/placeholder-image.png'}
                      alt="User Image"
                      sx={{ width: 150, height: 150 }}
                    />
                    <Button disabled={isLoading}
                      variant="outlined"
                      component="label"
                      sx={{ mt: 2 }}
                    >
                      Chọn Ảnh
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                      />
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel required>Họ</FormLabel>
                        <Input
                          value={employeeData.last_name}
                          name="last_name"
                          onChange={handleChange}

                          placeholder='Họ'
                        />
                        {errors.last_name && (
                          <Typography color="error" variant="body2">{errors.last_name}</Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel required>Tên</FormLabel>
                        <Input
                          value={employeeData.first_name || ''}
                          name="first_name"
                          onChange={handleChange}
                          placeholder='Tên'
                        />
                        {errors.first_name && (
                          <Typography color="error" variant="body2">{errors.first_name}</Typography>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel required>Email</FormLabel>
                        <Input
                          value={employeeData.email || ''}
                          name="email"
                          onChange={handleChange}
                          placeholder='Email'
                          type="email"
                        />
                        {errors.email && (
                          <Typography color="error" variant="body2">{errors.email}</Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel required>Số Điện Thoại</FormLabel>
                        <Input
                          value={employeeData.phone_number || ''}
                          name="phone_number"
                          onChange={handleChange}
                          placeholder='Số Điện Thoại'
                        />
                        {errors.phone_number && (
                          <Typography color="error" variant="body2">{errors.phone_number}</Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl disabled>
                        <FormLabel required>Lương</FormLabel>
                        <Input
                          value={employeeData.salary || ''}
                          name='salary'
                          onChange={handleChange}
                          type="number"
                        />
                        {errors.salary && (
                          <Typography color="error" variant="body2">{errors.salary}</Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl disabled>
                        <FormLabel required>Chức vụ</FormLabel>
                        <Select
                          value={position || employeeData.position || ""} // Đặt giá trị mặc định là chuỗi rỗng
                          placeholder="Chọn chức vụ"
                          onChange={(e, v) => {
                            setPosition(v);
                            setEmployeeData((prevData) => ({ ...prevData, position: v })); // Cập nhật trực tiếp vào employeeData
                          }}
                        >
                          {positions?.map((item) => (
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                          ))}
                        </Select>
                      </FormControl>

                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel required>Giới tính</FormLabel>
                        <RadioGroup >
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Radio
                              label="Nam"
                              checked={employeeData.gender === 'MALE'}
                              onChange={handleChange}
                              value="MALE"
                              name="gender"
                            />
                            <Radio
                              label="Nữ"
                              checked={employeeData.gender === 'FEMALE'}
                              onChange={handleChange}
                              value="FEMALE"
                              name="gender"
                            />
                            <Radio
                              label="Khác"
                              checked={employeeData.gender === 'OTHER'}
                              onChange={handleChange}
                              value="OTHER"
                              name="gender"
                            />
                          </Box>
                          {errors.gender && (
                            <Typography color="error" variant="body2">{errors.gender}</Typography>
                          )}
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel required>Ngày sinh</FormLabel>
                        <Input
                          name="date_of_birth"
                          value={employeeData.date_of_birth || ""}
                          onChange={handleChange}
                          type="date"
                        />
                        {errors.date_of_birth && (
                          <Typography color="error" variant="body2">{errors.date_of_birth}</Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel >Thành phố</FormLabel>
                        <Select value={selectedCity || ''} onChange={(e, v) => handleCityChange(v)} placeholder="Chọn thành phố">
                          <Option value="" disabled>
                            Chọn tỉnh thành
                          </Option>
                          {cities.map((city) => (
                            <Option key={city.code} value={city.code}>
                              {city.name}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel >Quận/Huyện</FormLabel>
                        <Select value={selectedDistrict || ''}
                          onChange={(e, v) => handleDistrictChange(v)}
                          placeholder="Chọn quận huyện">
                          <Option value="" disabled>
                            Chọn quận huyện
                          </Option>
                          {districts.map((district) => (
                            <Option key={district.code} value={district.code}>
                              {district.name}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel >Phường/Xã</FormLabel>
                        <Select value={selectedWard || ''} onChange={(e, v) => handleWardChange(v)}
                          placeholder="Chọn phường xã">
                          <Option value="" disabled>
                            Chọn phường xã
                          </Option>
                          {wards.map((ward) => (
                            <Option key={ward.code} value={ward.name}>
                              {ward.name}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel>Tên đường</FormLabel>
                        <Input
                          name="streetName"
                          value={employeeData.streetName}
                          placeholder='Tên đường'
                          onChange={handleChange}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} sx={{ marginTop: 1 }}>
                    <Button loading={isLoading} variant="soft" type="submit" color='primary' sx={{ marginRight: 1 }}>
                      Cập Nhật Người Dùng
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
export default EmployeeMe;
