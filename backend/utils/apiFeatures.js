class APIFeatures {
    constructor (query, queryStr, searchFields){
        this.query = query;
        this.queryStr = queryStr;
        this.searchFields = searchFields;
    }

    search_(){
        const keywordSingleField = this.queryStr.keyword? {
            firstName: {
                $regex: this.queryStr.keyword, 
                $options: 'i'
            }
        } : {}

        const category = this.queryStr.category? {
            ['category.key']:{ $regex: this.queryStr.category, $options:'i'}
        } : {}
        
        const keyword = this.queryStr.keyword? 
                        this.searchFields.map(field => ({[field]:{
                            $regex: this.queryStr.keyword, 
                            $options: 'i'
                        }}))
                        : [{}]

        // this.query = this.query.find({...keywordSingleField})
        this.query = this.query.find({$and:[{$or:[...keyword]},{...category}]})
        
        return this;
    }

    search() {
        const keywords = this.queryStr.keyword ? this.queryStr.keyword.split("_") : [];
        
        const keywordFields = keywords.length > 0 ? this.searchFields.map(field => ({
            [field]: {
            $in: keywords.map(keyword => new RegExp(keyword, "i"))
            }
        })) : [{}];
        
        const category = this.queryStr.category ? {
            "category.key": { $regex: this.queryStr.category, $options: "i" }
        } : {};
        
        this.query = this.query.find({ $and: [...keywordFields, { ...category }] });

        return this;
    }


    filter(){
        let queryCopy = {...this.queryStr};

        // Removing fields from the query
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach(el => delete queryCopy[el]);

        // this.filterFields.map(field => ({[field]: {$regex: 'yenagoa', $options: 'i'}}));

        // Advance filter for price, rating etc
        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    pagination(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage -1);

        this.query.limit(resPerPage).skip(skip);

        return this;
    }
}

module.exports = APIFeatures;