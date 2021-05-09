import {Component, ElementRef, EventEmitter, Output, Renderer2, ViewChild} from '@angular/core';
import * as yaml from 'js-yaml';
import {CommandViewService} from './command-view.service';
import {CommandResponse} from '../command-response.model';

@Component({
  selector: 'app-command-view',
  templateUrl: './command-view.component.html',
  styleUrls: ['./command-view.component.css']
})
export class CommandViewComponent {

  editorOptions = {theme: 'vs-dark', language: 'yaml', cursorWidth: 7};

  @Output() serverResponse = new EventEmitter<CommandResponse>();

  @ViewChild('terminal') terminal: ElementRef;

  input: {
    content: string;
    previousCommands: string[];
    selectedCommand: number;
  };

  output: {
    content: string;
    style: string;
  };

  constructor(private renderer: Renderer2, private userViewService: CommandViewService) {
    this.input = {
      content: '',
      previousCommands: [],
      selectedCommand: 0
    };
    this.output = {
      content: '',
      style: ''
    };
  }

  keyEvent(e: KeyboardEvent): void {
    this.output.style = 'margin-block-start: 2em;';
    const keyMap = {
      Enter: (event) => {
        if (event.ctrlKey) {
          this.input.content = this.input.content.substring(0, this.input.content.length - 2);
          event.preventDefault();
          this.executeCommand();
        }
      },
      ArrowUp: (event) => {
        if (event.ctrlKey) {
          event.preventDefault();
          this.loadPastCommand(this.input.selectedCommand - 1);
        }
      },
      ArrowDown: (event) => {
        if (event.ctrlKey) {
          event.preventDefault();
          this.loadPastCommand(this.input.selectedCommand + 1);
        }
      }
    };
    if (keyMap[e.code]) {
      keyMap[e.code](e);
    }
    this.terminal.nativeElement.scrollTop = this.terminal.nativeElement.scrollHeight;
  }

  private executeCommand(): void {
    this.input.previousCommands.push(this.input.content);
    this.input.selectedCommand = this.input.previousCommands.length;
    this.showResponse();
    this.input.content = '';
  }

  private showResponse(): void {
    const commands = {
      help: 'Available commands:<br />clear<br />help<br />add:<br />modify:<br />delete:<br />open:<br />close',
      'add:': 'Added successfully.',
      'modify:': 'Modified successfully.',
      'delete:': 'Deleted successfully.',
      'open:': 'Opened successfully.',
      close: 'Closed successfully.'
    };
    let command = this.input.content.split('\n')[0];
    if (!commands[command] && command !== 'clear'){
      command = command.substring(0, command.length - 1);
    }
    this.output.style = 'margin-block-start: 2em;';
    if (commands[command]) {
      if (command === 'help'){
        this.output.content = '<p>' + commands[command] + '</p>';
      } else {
        this.sendCommandToServer(commands[command]);
      }
    } else if (command === 'clear') {
      this.output.content = '';
      this.output.style = 'margin-block-start: 0em;';
    } else {
      this.output.content = '<p>Command "' + this.parseToHTML(this.input.content) + '" not identified.<br />To see command\'s list, write: help</p>';
    }
  }

  private sendCommandToServer(consoleResponse: string): void {
    try {
      const commandObject = yaml.load(this.input.content, { schema: yaml.JSON_SCHEMA });
      this.userViewService.sendCommand(commandObject)
        .subscribe((response) => {
          this.serverResponse.emit(response);
          this.output.content = '<p>' + consoleResponse + '</p>';
        }, error => {
          this.output.content = '<p>' + error + '</p>';
        });
      this.output.content = '<p>Executing...</p>';
    } catch (e) {
      this.output.content = '<p>' + e.name + ': Yaml syntax is not correct.</p>';
    }
  }

  private parseToHTML(input: string): string {
    let parsed = input;
    parsed = parsed.replace(/\n/g, '<br/>');
    parsed = parsed.replace(/ /g, '&nbsp;');
    return parsed;
  }

  private loadPastCommand(pastCommand: number): void {
    if (pastCommand >= 0 && pastCommand < this.input.previousCommands.length){
      this.input.content = this.input.previousCommands[pastCommand];
      this.input.selectedCommand = pastCommand;
    }
  }

}
