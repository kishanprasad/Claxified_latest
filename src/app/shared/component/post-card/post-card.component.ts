import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from '../../service/common.service';

@Component({
    selector: 'app-post-card',
    templateUrl: './post-card.component.html',
    styleUrls: ['./post-card.component.css']
})
export class PostCardComponent implements OnInit {

    @Input() isLoading: Boolean = false;
    @Input() cards: any;
    currentDate: Date = new Date();

    // Pagination properties
    pageSize = 20;
    currentPage = 0;
    totalPages = 0;
    paginatedCards: any[] = [];
    mainCategories: any = [];
    mainCategory: any;
    constructor(private router: Router, private commonService: CommonService) { }

    ngOnInit() {
        this.paginatedCards = this.cards;
        this.getMainCategories();
    }
    formatDate(date: any): any {
        const inputDate: Date = new Date(date);
        const daysAgo = moment(this.currentDate).diff(inputDate, 'days');

        if (daysAgo >= 0 && daysAgo <= 7) {
            if (daysAgo === 0) {
                return 'Today';
            } else if (daysAgo === 1) {
                return 'Yesterday';
            } else {
                return daysAgo + ' days ago';
            }
        } else {
            return moment(inputDate).format('MMM DD');
        }
    }
    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.calculatePagination();
    }
    calculatePagination() {
        this.totalPages = Math.ceil(this.cards.length / this.pageSize);
        this.paginatedCards = this.cards.slice(
            this.currentPage * this.pageSize,
            (this.currentPage + 1) * this.pageSize
        );
    }
    navigateToDetails(data: any) {
        this.router.navigate(["/"+this.mainCategory + '/post-details', data.tableRefGuid]);
    }
    getMainCategories() {
        this.commonService.getAllCategory().subscribe((data: any) => {
            this.mainCategories = data;
            this.getMainCategoryName(this.paginatedCards);
        });
    }
    onLinkRightClick(data: any) {
        this.getMainCategoryName(this.paginatedCards);
    }
    getMainCategoryName(data:any){
        for (var i = 0; i < this.mainCategories.length; i++) {
            if (this.mainCategories[i].id == data[0].categoryId){
                this.mainCategory = this.mainCategories[i].categoryName;
                break;
            }
        }
    }
}
