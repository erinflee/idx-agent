// Week 3 — recent sold comps over california_sold
//
// Given a city, return recently CLOSED sales -> agents can compare an active listing against real comps


import { query } from "../shared/db";


export async function getSoldComps(city: string, months = 12): Promise<SoldRow[]> {

  let sql = `
    SELECT
      ClosePrice as closePrice,
      CloseDate as closeDate,
      OriginalListPrice as originalListPrice,
      DaysOnMarket as dom,
      LivingArea as sqft,
      BedroomsTotal as beds,
      BathroomsTotalInteger as baths,
      City as city,
      PostalCode as zip,
      UnparsedAddress as address,
      PropertySubType as property,
      PoolPrivateYN as pool,
      ViewYN as view,
      AssociateFee as hoa,
    FROM california_sold
    WHERE 
      CITY = ?
      AND PropertySubType = "SingleFamilyResidence"
      AND CloseDate >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      AND CloseDate <= CURDATE()
    LIMIT 50
  `;


}
