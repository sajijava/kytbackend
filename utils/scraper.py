import scrapy
import re

TAG_RE = re.compile(r'<[^>]+>')

class WebScrapper(scrapy.Spider):
	name = "YPScrapper"
	start_urls = ["https://www.yellowpages.com/search?search_terms=restaurants&geo_location_terms=Woodbridge%2C+NJ"]
#	custome_settings = {
#		'FEED_URI' : './results'
#	}

	global domain
	domain = "https://www.yellowpages.com"

	def parse(self, response):		
		for resset in response.xpath('//div[@class="v-card"]//a[@class="business-name"] | //div[@class="pagination"]//li/a'): 
			link = resset.xpath('.//@href').extract()

			if link:
				yield response.follow(domain+link[0], self.parse)




		for businessPage in response.xpath('//header[@id="main-header"]'):
			
			returnObj = {}

			businessName = businessPage.xpath('.//article/div[@class="sales-info"]/h1/text()').extract()
			returnObj['name'] = businessName[0] if len(businessName) > 0 else ''

			address = businessPage.xpath('.//article/section[@class="primary-info"]/div/h2/text()').extract()
			returnObj['address'] = address[0] if len(address) > 0 else ''			

			phone = businessPage.xpath('.//article/section[@class="primary-info"]/div/p/text()').extract()
			returnObj['phone'] = phone[0] if len(phone) > 0 else ''			

			yrInBusiness = 	businessPage.xpath('.//article/section[@class="primary-info"]/div[@class="years-in-business"]/div/div/text()').extract()
			returnObj['years_in_business'] = yrInBusiness[0] if len(yrInBusiness) > 0 else ''			

			desc = response.xpath('//article[@id="main-article"]/section/section[@id="business-info"]/*/dt[text()="General Info"]/following-sibling::dd[1]/text()').extract()
			returnObj['general_info'] = desc[0] if len(desc) > 0 else ''
			
			categories = []
			for ctg  in response.xpath('//article[@id="main-article"]/section/section[@id="business-info"]/*/dt[text()="Categories"]/following-sibling::dd[1]/span/a/text()'):
				if ctg :
					categories.append(ctg.extract())
			returnObj['categories'] = categories

			hours = []
			for hrs in response.xpath('//article[@id="main-article"]/section/section[@id="business-info"]/*/dt[text()="Hours"]/following-sibling::dd[1]//tr'):
				h_label = hrs.xpath('./th/text()').extract()
				h_hours = hrs.xpath('./td/time/text()').extract()
				
				if len(h_hours) > 0 :
					obj = {}
					obj[h_label[0]] = h_hours[0]
					hours.append(obj)
				
			returnObj["hours"] = hours

			others = []
			for oth in response.xpath('//article[@id="main-article"]/section/section[@id="business-info"]/*/dt[text()="Other Information"]/following-sibling::dd[1]/p'):
				o = TAG_RE.sub('',oth.extract())
				o = o.replace(u'\xa0', u' ')
				others.append(o);
			returnObj["others"] = others				

			lat = businessPage.xpath('.//article/section[@class="business-card-map"]//div[@id="bpp-static-map"]/@data-lat').extract()
			lng = businessPage.xpath('.//article/section[@class="business-card-map"]//div[@id="bpp-static-map"]/@data-lng').extract()

			returnObj['location'] = {'lat':lat[0],'long':lng[0]} if len(lat) > 0 else ''			

			yield returnObj

		#	print("******************** NEXT PAGE "+nextpage)
	#		yield response.follow(nextpage, self.parse)
    		#print busiName
			#address = response.xpath('//div[@class="info-primary"]/p[@class="adr"]/span').extract()
			


