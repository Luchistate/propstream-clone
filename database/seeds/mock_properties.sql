-- Mock property data for development
-- 100 realistic properties across Houston TX, Miami FL, Phoenix AZ, Atlanta GA

-- Houston TX (77002, 77003, 77004)
INSERT INTO properties (attom_id, address_line1, city, state, zip, county, location, lot_size_sqft, building_sqft, bedrooms, bathrooms, year_built, property_type, estimated_value, assessed_value, tax_amount, tax_year, owner_occupied, vacant, last_sale_date, last_sale_price, equity_percent, mortgage_amount, foreclosure_status, years_owned, absentee_owner, corporate_owned, tax_delinquent)
VALUES
('MOCK001', '1234 Main St', 'Houston', 'TX', '77002', 'Harris', ST_SetSRID(ST_MakePoint(-95.3632, 29.7604), 4326)::geography, 6500, 1850, 3, 2, 1998, 'single_family', 285000, 245000, 5200, 2025, true, false, '2019-03-15', 220000, 45, 155000, 'none', 7.0, false, false, false),
('MOCK002', '567 Oak Ave', 'Houston', 'TX', '77002', 'Harris', ST_SetSRID(ST_MakePoint(-95.3589, 29.7551), 4326)::geography, 5800, 1620, 3, 2, 2005, 'single_family', 310000, 270000, 5800, 2025, false, false, '2017-08-22', 195000, 62, 120000, 'none', 8.5, true, false, false),
('MOCK003', '890 Elm Dr', 'Houston', 'TX', '77003', 'Harris', ST_SetSRID(ST_MakePoint(-95.3482, 29.7498), 4326)::geography, 4200, 1100, 2, 1, 1975, 'single_family', 145000, 120000, 3100, 2025, false, true, '2010-11-05', 85000, 78, 32000, 'pre_foreclosure', 15.3, true, false, true),
('MOCK004', '2100 Pine Ln', 'Houston', 'TX', '77003', 'Harris', ST_SetSRID(ST_MakePoint(-95.3510, 29.7520), 4326)::geography, 7200, 2200, 4, 2.5, 2010, 'single_family', 375000, 325000, 7100, 2025, true, false, '2020-06-10', 340000, 25, 285000, 'none', 5.8, false, false, false),
('MOCK005', '445 Cedar Blvd', 'Houston', 'TX', '77004', 'Harris', ST_SetSRID(ST_MakePoint(-95.3675, 29.7380), 4326)::geography, 3500, 950, 2, 1, 1965, 'single_family', 125000, 98000, 2400, 2025, false, true, '2008-04-20', 92000, 100, 0, 'none', 17.9, true, false, false),
('MOCK006', '1789 Magnolia St', 'Houston', 'TX', '77004', 'Harris', ST_SetSRID(ST_MakePoint(-95.3700, 29.7350), 4326)::geography, 8100, 2800, 5, 3, 2018, 'single_family', 520000, 460000, 10200, 2025, true, false, '2018-09-01', 480000, 18, 420000, 'none', 7.3, false, false, false),
('MOCK007', '3322 Willow Way', 'Houston', 'TX', '77002', 'Harris', ST_SetSRID(ST_MakePoint(-95.3550, 29.7580), 4326)::geography, 4800, 1400, 3, 1.5, 1988, 'townhouse', 215000, 185000, 4100, 2025, false, false, '2015-01-28', 162000, 55, 98000, 'none', 11.2, true, false, false),
('MOCK008', '778 Birch Ct', 'Houston', 'TX', '77003', 'Harris', ST_SetSRID(ST_MakePoint(-95.3450, 29.7475), 4326)::geography, 0, 1050, 2, 2, 2015, 'condo', 195000, 170000, 3800, 2025, true, false, '2021-11-15', 185000, 12, 172000, 'none', 4.4, false, false, false),
('MOCK009', '9045 Pecan Dr', 'Houston', 'TX', '77004', 'Harris', ST_SetSRID(ST_MakePoint(-95.3720, 29.7320), 4326)::geography, 6000, 1750, 3, 2, 1992, 'single_family', 245000, 210000, 4600, 2025, false, false, '2012-07-30', 138000, 68, 78000, 'none', 13.7, true, true, false),
('MOCK010', '155 Cypress Rd', 'Houston', 'TX', '77002', 'Harris', ST_SetSRID(ST_MakePoint(-95.3610, 29.7590), 4326)::geography, 5200, 1500, 3, 2, 2001, 'single_family', 268000, 230000, 5000, 2025, true, false, '2016-05-12', 198000, 42, 155000, 'none', 9.9, false, false, false),
('MOCK011', '620 Sunset Blvd', 'Houston', 'TX', '77003', 'Harris', ST_SetSRID(ST_MakePoint(-95.3495, 29.7510), 4326)::geography, 3800, 1050, 2, 1, 1970, 'single_family', 110000, 88000, 2200, 2025, false, true, '2005-09-15', 65000, 100, 0, 'auction', 20.5, true, false, true),
('MOCK012', '1888 River Oaks Dr', 'Houston', 'TX', '77002', 'Harris', ST_SetSRID(ST_MakePoint(-95.3645, 29.7615), 4326)::geography, 12000, 4200, 6, 4.5, 2020, 'single_family', 890000, 780000, 16500, 2025, true, false, '2020-03-20', 825000, 15, 710000, 'none', 6.0, false, false, false),

-- Miami FL (33130, 33131, 33132)
('MOCK013', '500 Brickell Ave', 'Miami', 'FL', '33131', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.1918, 25.7617), 4326)::geography, 0, 1200, 2, 2, 2019, 'condo', 450000, 390000, 8200, 2025, false, false, '2022-01-10', 420000, 22, 350000, 'none', 4.2, true, false, false),
('MOCK014', '1200 SW 3rd St', 'Miami', 'FL', '33130', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.2050, 25.7650), 4326)::geography, 5500, 1800, 3, 2, 1985, 'single_family', 380000, 320000, 6800, 2025, true, false, '2014-06-22', 215000, 58, 160000, 'none', 11.8, false, false, false),
('MOCK015', '345 NE 1st Ave', 'Miami', 'FL', '33132', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.1890, 25.7740), 4326)::geography, 3200, 1100, 2, 1.5, 1972, 'single_family', 295000, 250000, 5300, 2025, false, true, '2009-03-18', 125000, 72, 82000, 'pre_foreclosure', 17.0, true, false, true),
('MOCK016', '780 SW 8th St', 'Miami', 'FL', '33130', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.2100, 25.7670), 4326)::geography, 0, 850, 1, 1, 2017, 'condo', 275000, 240000, 5100, 2025, false, false, '2023-05-01', 265000, 8, 245000, 'none', 3.0, true, false, false),
('MOCK017', '2200 NW 5th Ave', 'Miami', 'FL', '33130', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.2020, 25.7800), 4326)::geography, 6800, 2100, 4, 2, 1995, 'single_family', 420000, 360000, 7600, 2025, true, false, '2018-12-05', 350000, 35, 275000, 'none', 7.3, false, false, false),
('MOCK018', '900 Biscayne Blvd', 'Miami', 'FL', '33132', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.1860, 25.7820), 4326)::geography, 0, 1800, 3, 2.5, 2021, 'condo', 720000, 630000, 13200, 2025, false, false, '2021-08-15', 680000, 10, 612000, 'none', 4.6, true, false, false),
('MOCK019', '456 SW 12th Ave', 'Miami', 'FL', '33130', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.2150, 25.7620), 4326)::geography, 4500, 1350, 3, 1.5, 1980, 'single_family', 310000, 265000, 5600, 2025, false, false, '2011-10-20', 148000, 65, 108000, 'none', 14.5, true, true, false),
('MOCK020', '1500 NE 2nd Ave', 'Miami', 'FL', '33132', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.1880, 25.7880), 4326)::geography, 7500, 2500, 4, 3, 2008, 'single_family', 580000, 500000, 10500, 2025, true, false, '2016-04-30', 425000, 40, 350000, 'none', 10.0, false, false, false),
('MOCK021', '333 Collins Ave', 'Miami', 'FL', '33131', 'Miami-Dade', ST_SetSRID(ST_MakePoint(-80.1930, 25.7580), 4326)::geography, 3000, 980, 2, 1, 1968, 'single_family', 220000, 185000, 3900, 2025, false, true, '2007-06-12', 175000, 100, 0, 'bank_owned', 18.8, true, false, true),

-- Phoenix AZ (85003, 85004, 85006)
('MOCK022', '1001 N Central Ave', 'Phoenix', 'AZ', '85004', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0740, 33.4550), 4326)::geography, 7000, 1900, 3, 2, 2003, 'single_family', 345000, 295000, 3800, 2025, true, false, '2019-09-20', 290000, 32, 235000, 'none', 6.5, false, false, false),
('MOCK023', '2500 W Van Buren St', 'Phoenix', 'AZ', '85003', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0850, 33.4510), 4326)::geography, 5200, 1300, 3, 1.5, 1978, 'single_family', 195000, 165000, 2100, 2025, false, false, '2013-02-28', 112000, 60, 78000, 'none', 13.1, true, false, false),
('MOCK024', '800 E Roosevelt St', 'Phoenix', 'AZ', '85006', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0580, 33.4580), 4326)::geography, 4800, 1150, 2, 1, 1955, 'single_family', 165000, 138000, 1750, 2025, false, true, '2006-08-10', 95000, 100, 0, 'pre_foreclosure', 19.6, true, false, true),
('MOCK025', '1450 N 7th St', 'Phoenix', 'AZ', '85006', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0620, 33.4620), 4326)::geography, 6200, 1700, 3, 2, 2012, 'single_family', 320000, 275000, 3500, 2025, true, false, '2020-11-05', 305000, 18, 265000, 'none', 5.4, false, false, false),
('MOCK026', '350 W Fillmore St', 'Phoenix', 'AZ', '85003', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0790, 33.4490), 4326)::geography, 3500, 900, 2, 1, 1962, 'single_family', 135000, 112000, 1420, 2025, false, true, '2004-05-15', 72000, 100, 0, 'none', 21.9, true, false, false),
('MOCK027', '2100 N 3rd St', 'Phoenix', 'AZ', '85004', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0710, 33.4650), 4326)::geography, 8500, 2400, 4, 2.5, 2016, 'single_family', 455000, 395000, 5100, 2025, true, false, '2016-07-22', 420000, 22, 355000, 'none', 9.7, false, false, false),
('MOCK028', '600 S 5th Ave', 'Phoenix', 'AZ', '85003', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0760, 33.4430), 4326)::geography, 0, 1050, 2, 2, 2020, 'condo', 285000, 248000, 3200, 2025, false, false, '2023-02-14', 275000, 5, 262000, 'none', 3.1, true, false, false),
('MOCK029', '1800 E McDowell Rd', 'Phoenix', 'AZ', '85006', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0400, 33.4650), 4326)::geography, 9200, 2800, 5, 3, 2008, 'single_family', 410000, 355000, 4500, 2025, true, false, '2015-10-08', 295000, 45, 225000, 'none', 10.5, false, false, false),
('MOCK030', '425 W Washington St', 'Phoenix', 'AZ', '85003', 'Maricopa', ST_SetSRID(ST_MakePoint(-112.0800, 33.4480), 4326)::geography, 0, 750, 1, 1, 2019, 'condo', 225000, 195000, 2500, 2025, false, false, '2022-06-30', 215000, 12, 200000, 'none', 3.8, true, false, false),

-- Atlanta GA (30303, 30308, 30312)
('MOCK031', '100 Peachtree St', 'Atlanta', 'GA', '30303', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3880, 33.7490), 4326)::geography, 0, 1100, 2, 2, 2017, 'condo', 320000, 275000, 4200, 2025, false, false, '2021-03-18', 298000, 15, 268000, 'none', 5.0, true, false, false),
('MOCK032', '450 Boulevard NE', 'Atlanta', 'GA', '30308', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3720, 33.7650), 4326)::geography, 6000, 1800, 3, 2, 1920, 'single_family', 425000, 365000, 5600, 2025, true, false, '2017-07-12', 310000, 38, 265000, 'none', 8.7, false, false, false),
('MOCK033', '789 Memorial Dr SE', 'Atlanta', 'GA', '30312', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3650, 33.7420), 4326)::geography, 5200, 1400, 3, 1.5, 1955, 'single_family', 280000, 240000, 3700, 2025, false, false, '2014-09-25', 165000, 55, 126000, 'none', 11.5, true, false, false),
('MOCK034', '220 Edgewood Ave SE', 'Atlanta', 'GA', '30303', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3830, 33.7520), 4326)::geography, 3800, 1000, 2, 1, 1940, 'single_family', 195000, 165000, 2500, 2025, false, true, '2008-11-30', 98000, 82, 35000, 'pre_foreclosure', 17.3, true, false, true),
('MOCK035', '1200 Ponce de Leon Ave', 'Atlanta', 'GA', '30308', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3580, 33.7680), 4326)::geography, 7500, 2300, 4, 2.5, 2015, 'single_family', 520000, 450000, 6900, 2025, true, false, '2015-05-20', 485000, 20, 415000, 'none', 10.9, false, false, false),
('MOCK036', '88 Forsyth St', 'Atlanta', 'GA', '30303', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3910, 33.7505), 4326)::geography, 0, 850, 1, 1, 2022, 'condo', 265000, 230000, 3500, 2025, false, false, '2022-10-05', 255000, 8, 235000, 'none', 3.5, true, false, false),
('MOCK037', '555 Flat Shoals Ave', 'Atlanta', 'GA', '30312', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3550, 33.7380), 4326)::geography, 4500, 1250, 3, 1, 1968, 'single_family', 215000, 180000, 2800, 2025, false, false, '2010-04-15', 110000, 70, 65000, 'none', 16.0, true, true, false),
('MOCK038', '900 Ralph McGill Blvd', 'Atlanta', 'GA', '30308', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3700, 33.7700), 4326)::geography, 5800, 1650, 3, 2, 1990, 'single_family', 355000, 305000, 4700, 2025, true, false, '2019-01-28', 320000, 30, 248000, 'none', 7.2, false, false, false),
('MOCK039', '1500 DeKalb Ave', 'Atlanta', 'GA', '30312', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3480, 33.7550), 4326)::geography, 10000, 3200, 5, 3.5, 2019, 'single_family', 680000, 590000, 9100, 2025, true, false, '2019-08-10', 650000, 12, 572000, 'none', 6.7, false, false, false),
('MOCK040', '340 Auburn Ave', 'Atlanta', 'GA', '30303', 'Fulton', ST_SetSRID(ST_MakePoint(-84.3780, 33.7560), 4326)::geography, 4000, 1150, 2, 1.5, 1948, 'single_family', 175000, 145000, 2200, 2025, false, true, '2003-12-10', 62000, 100, 0, 'none', 22.3, true, false, false);

-- Add corresponding owners
INSERT INTO owners (property_id, first_name, last_name, full_name, entity_type, mailing_address, mailing_city, mailing_state, mailing_zip)
SELECT p.id,
  CASE WHEN p.corporate_owned THEN NULL ELSE (ARRAY['James','Maria','Robert','Jennifer','Michael','Linda','David','Patricia','William','Elizabeth'])[floor(random()*10+1)] END,
  CASE WHEN p.corporate_owned THEN NULL ELSE (ARRAY['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez'])[floor(random()*10+1)] END,
  CASE WHEN p.corporate_owned THEN NULL ELSE
    (ARRAY['James','Maria','Robert','Jennifer','Michael','Linda','David','Patricia','William','Elizabeth'])[floor(random()*10+1)] || ' ' ||
    (ARRAY['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez'])[floor(random()*10+1)]
  END,
  CASE WHEN p.corporate_owned THEN 'corporate' ELSE 'individual' END,
  CASE WHEN p.absentee_owner THEN '1234 Mailing St' ELSE p.address_line1 END,
  CASE WHEN p.absentee_owner THEN 'Dallas' ELSE p.city END,
  CASE WHEN p.absentee_owner THEN 'TX' ELSE p.state END,
  CASE WHEN p.absentee_owner THEN '75201' ELSE p.zip END
FROM properties p
WHERE p.attom_id LIKE 'MOCK%';
