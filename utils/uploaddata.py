import uuid
import json
import calendar
import re
import mysql.connector
from mysql.connector import errorcode




def insertToDB(connection, insertQuery, dataTouple):
	print(insertQuery)
	print(dataTouple)
	try:

		cursor = connection.cursor()
		cursor.execute(insertQuery, dataTouple)
		connection.commit()

		print("Record inserted successfully...")
	except mysql.connector.Error as error:
		print("Failed to insert into MySQL table {}".format(error))
	finally:
		if (connection.is_connected()):
			cursor.close()
			print("MySQL connection is closed")

def parseAddress(address):
	addr  = address.split(',')
	#print (address)
	#print (addr)
	state,zip = tuple(addr[2].split())
	return (addr[0], addr[1], state, zip)


def createGeoLocation(connection,id, row):
	location = row['location']
	if location:
		lat  = float(location['lat'])
		long = float(location['long'])
		if lat :
			insertToDB(connection,
					   """INSERT INTO GEO_LOCATION (LOCATION_UID,LATITUDE,LONGITUDE)
                            VALUES (%(uid)s, %(lat)s, %(long)s)""",
					   {'uid': id, 'lat': lat, 'long': long, })

def convertDateto24HrFormat(timelist):
	#print(timelist)
	if isinstance(timelist, list):
		hh = int(timelist[0])
		mm = int(timelist[1])
		meridian = timelist[2]

		if (meridian == 'am' and hh == 12) or (meridian == 'pm' and not hh == 12):
			hh = hh + 12

		r = (hh * 10000)+(mm * 100);
	#	print(r)
	return r

def createOperatingTime(connection,id, row):
	hours = row['hours']
	#print(hours)
	weekday = []
	for wk in range(len(calendar.day_name)):
		weekday.append(calendar.day_name[wk][:3].lower())

	keyPattern = r"([a-zA-Z]+)\W"
	valPattern = r"([0-9]+):([0-9]+)\s(am|pm)\W*"


	#print(weekday)
	openDays = []
	for h in hours:
		#print(h)
		time = {}
		matchTime = re.findall(valPattern, list(h.values())[0])
		if len(matchTime) > 1:
			time['start'] = convertDateto24HrFormat(list(matchTime[0]))
			time['end'] = convertDateto24HrFormat(list(matchTime[1]))


		matchObj = re.findall(keyPattern,list(h.keys())[0])
		#print(matchObj)
		if len(matchObj) > 1:
			startIdx = weekday.index(matchObj[0].lower())
			endIdx = weekday.index(matchObj[1].lower())
			for w in range(startIdx,endIdx+1):
				#print(w)
				#print(time)
				openDays.append({'day':calendar.day_name[w],'start':time['start'],'end':time['end']})
		else:
			openDays.append({'day': calendar.day_name[weekday.index(matchObj[0].lower())], 'start': time['start'], 'end': time['end']})

	if len(openDays) > 0 :
		for idx, openHrs in enumerate(openDays):
			insertToDB(connection,
					   """INSERT INTO OPERATING_TIME (LOCATION_UID,DAY_OF_WEEK,OPEN_TIME,CLOSE_TIME)
							VALUES (%(luid)s, %(dayofweek)s, %(opentime)s, %(closetime)s)""",
					   {'luid': id, 'dayofweek':openHrs['day'], 'opentime':openHrs['start'], 'closetime':openHrs['end']})




## Does not handel these patterns
# **********************  could not parse address 385 Main St, Woodbridge NJ, 07095, Woodbridge NJ, 07095, Woodbridge, NJ 07095
#  **********************  could not parse address Woodbridge, NJ 07095
#  **********************  could not parse address 2333 Morris Ave, Located in Professional Building, Plenty of Parking in back of building. elevator Available, Union, NJ 07083
#  **********************  could not parse address 1077 F Highway 34 ,, Aberdeen, NJ 07747
#  **********************  could not parse address 755 Targee St, Located next to the SI Expressway 278, Richmond Road Exit, Staten Island, NY 10304
#  **********************  could not parse address 112 S 1st St,, Elizabeth, NJ 07202
#  **********************  could not parse address 111 State Route 35,, Keyport, NJ 07735
def createLocation(connection,id, row):
	address = row['address']
	phone = row['phone']
	if address:
		lid = uuid.uuid4().hex
		try:
			street, city, state, zip = parseAddress(address)
			insertToDB(connection,
					   """INSERT INTO LOCATION (ENTITY_UID,LOCATION_UID,STREET,CITY,state,ZIP,PHONE)
							VALUES (%(uid)s, %(luid)s, %(street)s, %(city)s, %(state)s, %(zip)s, %(phone)s)""",
					   {'uid': id, 'luid': lid, 'street':street, 'city':city, 'state':state, 'zip':zip, 'phone':phone})
			createGeoLocation(connection,lid,row)
			createOperatingTime(connection,lid,row)
		except:
			print(" **********************  could not parse address "+ address)



def createCategories(connection,uuid, row):
	catgs = row['categories']
	for category in catgs:
		if  category:
			insertToDB(connection,
				   """INSERT INTO CATEGORIES (ENTITY_UID,CATEGORY) VALUES (%(uid)s, %(category)s)""",
				   {'uid':uuid,'category':category})


def createEntityOthers(connection,uuid, row):
	others = row['others']
	print(others)
	otherProps = []
	if len(others) > 0:
		for o in others:
			others = o.split(":")
			multival = others[1].split(",")
			if len(multival) > 0:
				for val in multival:
					otherProps.append({'prop':others[0],'propval':val})
			else:
				otherProps.append({'prop': others[0], 'propval': others[1]})

	if len(otherProps) > 0:
		for pr in otherProps:
			insertToDB(connection,
				"""INSERT INTO ENTITY_ADDITION (ENTITY_UID,PROP,PROP_VALUE)
                	VALUES (%(uid)s, %(key)s, %(value)s)""",
					{'uid': uuid, 'key': pr['prop'], 'value': pr['propval']})





def createEntityGeneralInfo(connection,uuid, row):

	info = row['general_info'];
	#print(info)
	if info:
		insertToDB(connection,
				   """INSERT INTO ENTITY_ADDITION (ENTITY_UID,PROP,PROP_VALUE) 
				   VALUES (%(uid)s, %(key)s, %(value)s)""",
				   {'uid': uuid, 'key': 'About', 'value':info})





def createEntity(connection,uuid, row):

	yrOfBusiness = 0

	if str(row['years_in_business']):
		yrOfBusiness = int(row['years_in_business'])

	mySql_insert_query = """INSERT INTO ENTITY (ENTITY_UID,COMPANY_NAME,NUM_YEARS) VALUES (%(uid)s, %(name)s, %(numofyr)s)"""

	recordTuple = {'uid':uuid,'name':row['name'],'numofyr':yrOfBusiness}

	insertToDB(connection,mySql_insert_query,recordTuple)




try:

	config = {
		'user': 'root',
		'password': 'root',
		'host': '127.0.0.1',
		'database': 'knowyourtown',
		'raise_on_warnings': True
	}

	connection = mysql.connector.connect(**config)

	if connection.is_connected():
		db_Info = connection.get_server_info()
		print("Connected to MySQL Server version ", db_Info)
		cursor = connection.cursor()
		#remove all 
		cursor.execute("delete from entity")
		cursor.execute("delete from categories")
		cursor.execute("delete from location")
		cursor.execute("delete from geo_location")
		cursor.execute("delete from operating_time")
		cursor.execute("delete from entity_addition")
		#record = cursor.fetchall()
		#print("Your connected to database: ", record)

		print ("DB connected...")


		count = 0;
		with open('result.json') as json_file:
			data = json.load(json_file)
			for first in data:
				id = uuid.uuid4().hex
				createEntity(connection,id,first)
				createCategories(connection,id,first)
				createLocation(connection, id, first)
				createEntityGeneralInfo(connection, id, first)
				createEntityOthers(connection, id, first)

				count = count + 1;
				#if count > 100:
					#break

except mysql.connector.Error as err:
	if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
		print("Something is wrong with your user name or password")
	elif err.errno == errorcode.ER_BAD_DB_ERROR:
		print("Database does not exist")
	else:
		print(err)
else:
	connection.close()
