import {FlatTreeControl} from '@angular/cdk/tree';
import {AfterViewInit, Component, Input, OnChanges, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {PackageNode} from '../package-node.model';

interface FlatNode {
  expandable: boolean;
  id: string;
  name: string;
  level: number;
}

@Component({
  selector: 'app-repository-view',
  templateUrl: './repository-view.component.html',
  styleUrls: ['./repository-view.component.css']
})
export class RepositoryViewComponent implements OnInit, OnChanges {

  treeControl: FlatTreeControl<FlatNode>;
  treeFlattener: MatTreeFlattener<PackageNode, FlatNode, any>;
  dataSource: MatTreeFlatDataSource<PackageNode, FlatNode, any>;
  @Input() directoryTree: PackageNode[];
  @Input() activeMemberID: string;

  constructor() {
  }

  ngOnInit(): void {
    this.treeControl = new FlatTreeControl<FlatNode>(
      node => node.level, node => node.expandable);
    this.treeFlattener = new MatTreeFlattener(
      this.transformer, node => node.level, node => node.expandable, node => node.children);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = this.directoryTree;
    this.treeControl.expandAll();
    setTimeout(() => {
      if (document.getElementById(this.activeMemberID) !== null) {
        document.getElementById(this.activeMemberID).style.color = 'dimgrey';
      }
    }, 1);
  }

  private transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      id: node.id,
      name: node.name,
      level,
    };
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnChanges(): void {
    if (this.dataSource !== undefined && this.directoryTree !== undefined) {
      this.dataSource.data = this.directoryTree;
      this.treeControl.expandAll();
      this.paintProjects();
      this.paintSelectedNode();
    }
  }

  paintProjects(): void{
    setTimeout(() => {
      this.directoryTree[0].children.forEach(value =>  {
        if ( value.id !== this.activeMemberID && document.getElementById(value.id) !== null) {
          document.getElementById(value.id).style.color = 'cornflowerblue';
        }
      });
    }, 1);
  }

  paintSelectedNode(): void{
    setTimeout(() => {
      if (document.getElementById(this.activeMemberID)) {
        document.getElementById(this.activeMemberID).style.color = 'mediumblue';
      }
    }, 1);
  }

}
