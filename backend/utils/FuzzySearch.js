const Fuse = require('fuse.js')
const fuzzy = require
class FuzzySearch {
    constructor (documents, queryStr, searchFields){
        this.documents = documents;
        this.queryStr = queryStr;
        this.searchFields = searchFields;
    }


    search(){

        const keyword = this.queryStr.keyword;
        if (keyword) {
            const options = {
                keys: this.searchFields,
                includeScore: true,
                threshold: 0.5,
            };

            const fuse = new Fuse(this.documents, options);
            const searchResults = fuse.search(keyword);
            
            this.documents = searchResults.map((result) => result.item);
                        
        }

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

        this.documents = this.documents.find(JSON.parse(queryStr));

        return this;
    }

    pagination(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage -1);
        const to = skip + resPerPage;
        

        this.documents = this.documents.slice(skip, to);

        return this;
    }
}

module.exports = FuzzySearch;