/*
 *This program was produced for the U.S. Agency for International Development. It was prepared by the USAID | DELIVER PROJECT, Task Order 4. It is part of a project which utilizes code originally licensed under the terms of the Mozilla Public License (MPL) v2 and therefore is licensed under MPL v2 or later.

  * This program is free software: you can redistribute it and/or modify it under the terms of the Mozilla Public License as published by the Mozilla Foundation, either version 2 of the License, or (at your option) any later version.

  * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the Mozilla Public License for more details.

  * You should have received a copy of the Mozilla Public License along with this program. If not, see http://www.mozilla.org/MPL/
 */
package org.openlmis.core.repository.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.openlmis.core.domain.BaseModel;
import org.openlmis.core.domain.PriceSchedule;
import org.springframework.stereotype.Repository;

@Repository
public interface PriceScheduleMapper {


    @Insert("INSERT INTO price_schedule( productid, pricecatid, sale_price, createdBy,createdDate,modifiedDate,modifiedBy)\n " +
            "    VALUES ( #{product.id}, #{priceScheduleCategory.id}, #{salePrice}, #{createdBy},COALESCE(#{createdDate},NOW()),COALESCE(#{modifiedDate},NOW()),#{modifiedBy})")
    void insert(PriceSchedule priceSchedule);

    @Update("UPDATE price_schedule\n" +
            "   SET pricecatid=#{priceScheduleCategory.id}, productid=#{product.id}, sale_price=#{salePrice}, modifiedDate = #{modifiedDate}, modifiedBy = #{modifiedBy} WHERE id = #{id}")
    void update(PriceSchedule priceSchedule);

    @Select("SELECT * FROM price_schedule WHERE productid = #{productId} and priceCatid = #{priceScheduleCategoryId}")
    PriceSchedule getByProductCodePriceScheduleCategory(@Param("productId") Long productId, @Param("priceScheduleCategoryId")  Long priceScheduleCategoryId);

    @Select("SELECT id FROM price_schedule_category WHERE LOWER(price_category) = LOWER(#{priceScheduleCategory})")
    Long getPriceCategoryIdByName(String priceScheduleCategory);
}
